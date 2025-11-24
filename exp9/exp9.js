import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  SafeAreaView, View, Text, TextInput, Pressable, FlatList,
  KeyboardAvoidingView, Platform, StyleSheet, Alert
} from 'react-native';
import SQLite from 'react-native-sqlite-storage';
SQLite.enablePromise(true);
export default function App() {
  const [tasks, setTasks] = useState([]); // {id (number), text, done (0|1), created_at (ms)}
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const inputRef = useRef(null);
  const editRef = useRef(null);
  const dbRef = useRef(null);
 // Open DB + create table + initial load
  useEffect(() => {    let mounted = true;
    (async () => { try {
        const db = await SQLite.openDatabase({ name: 'todos.db', location: 'default' });
        if (!mounted) return;
        dbRef.current = db;
        await db.transaction(async (tx) => {
          await tx.executeSql(
            `CREATE TABLE IF NOT EXISTS tasks (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              text TEXT NOT NULL,
              done INTEGER NOT NULL DEFAULT 0,
              created_at INTEGER NOT NULL );` );
          await tx.executeSql(
            `CREATE INDEX IF NOT EXISTS idx_tasks_done_created ON tasks(done, created_at DESC);` );  });
        await loadTasks(); // load all tasks 
      } catch (e) {
        console.warn('DB init error', e);
        Alert.alert('Database Error', e?.message ?? 'Failed to open database');
      }    })();
    return () => {
      mounted = false;
      if (dbRef.current) dbRef.current.close().catch(() => {});    };  }, []);
  const loadTasks = async () => {    const db = dbRef.current;
    if (!db) return;
    const res = await db.executeSql(
      `SELECT id, text, done, created_at FROM tasks ORDER BY created_at DESC, id DESC;`
    );
    const rows = res[0].rows;
    const list = [];
    for (let i = 0; i < rows.length; i++) list.push(rows.item(i));
    setTasks(list);  };
const filtered = useMemo(() => {
    switch (filter) {
      case 'active': return tasks.filter(t => t.done === 0);
      case 'completed': return tasks.filter(t => t.done === 1);
      default: return tasks;  }
  }, [tasks, filter]);
  const addTask = async () => {
    const t = text.trim();
    if (!t) return;
    const db = dbRef.current; if (!db) return;
    await db.transaction(async (tx) => {
      await tx.executeSql(
        `INSERT INTO tasks(text, done, created_at) VALUES (?, 0, ?);`,
        [t, Date.now()]
      );
    });
    setText('');
    requestAnimationFrame(() => inputRef.current?.focus());
    await loadTasks();
  };
  const toggleTask = async (id) => {
    const db = dbRef.current; if (!db) return;
    const cur = tasks.find(t => t.id === id)?.done ? 1 : 0;
    const next = cur ? 0 : 1;
    await db.transaction(async (tx) => {
      await tx.executeSql(`UPDATE tasks SET done=? WHERE id=?;`, [next, id]);    });
    await loadTasks();  };
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingText(task.text);
    requestAnimationFrame(() => editRef.current?.focus());  };
  const saveEdit = async () => {
    const val = editingText.trim();
    if (!val) {
      Alert.alert('Empty title', 'Please enter some text or delete the task.');
      return;    }
    const db = dbRef.current; if (!db) return;
    await db.transaction(async (tx) => {
      await tx.executeSql(`UPDATE tasks SET text=? WHERE id=?;`, [val, editingId]);    });
    setEditingId(null);
    setEditingText('');
    await loadTasks();
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };
  const deleteTask = async (id) => {
    const db = dbRef.current; if (!db) return;
    await db.transaction(async (tx) => {
      await tx.executeSql(`DELETE FROM tasks WHERE id=?;`, [id]);    });
    await loadTasks();  };
  const clearCompleted = async () => {
    const db = dbRef.current; if (!db) return;
    const hasCompleted = tasks.some(t => t.done === 1);
    if (!hasCompleted) return;
    Alert.alert('Clear completed?', 'This will remove all completed tasks.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await db.transaction(async (tx) => {
            await tx.executeSql(`DELETE FROM tasks WHERE done=1;`);          });
          await loadTasks();        }      },    ]);  };
  const renderItem = ({item}) => {
    const isEditing = editingId === item.id;
    return (
      <View style={[styles.row, item.done === 1 && styles.rowDone]}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{checked: item.done === 1}}
          onPress={() => toggleTask(item.id)}
          style={[styles.checkbox, item.done === 1 && styles.checkboxOn]}
          {item.done === 1 ? <Text style={styles.checkboxTick}>✓</Text> : null}
        </Pressable>
        <View style={styles.rowCenter}>
          {isEditing ? (
            <TextInput
              ref={editRef}
              value={editingText}
              onChangeText={setEditingText}
              onSubmitEditing={saveEdit}
              blurOnSubmit
              style={[styles.input, styles.editInput]}
              placeholder="Edit task…"
              returnKeyType="done"            />          ) : (
            <Text style={[styles.taskText, item.done === 1 && styles.taskTextDone]} numberOfLines={2}>
              {item.text}
            </Text>          )}        </View>
        <View style={styles.actions}>
          {isEditing ? (            <>
              <Pressable onPress={saveEdit} style={[styles.actionBtn, styles.saveBtn]}>
                <Text style={styles.actionText}>Save</Text>
              </Pressable>
              <Pressable onPress={cancelEdit} style={[styles.actionBtn, styles.cancelBtn]}>
                <Text style={styles.actionText}>Cancel</Text>
              </Pressable>            </>          ) : (            <>
              <Pressable onPress={() => startEdit(item)} style={styles.actionBtn}>
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => deleteTask(item.id)} style={[styles.actionBtn, styles.deleteBtn]}>
                <Text style={styles.actionText}>Del</Text>
              </Pressable>            </>          )}        </View>
      </View>    );  };
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.title}>To-Do</Text>
          <Pressable onPress={clearCompleted} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear Completed</Text>
          </Pressable>        </View>
        <View style={styles.addBar}>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder="Add a task…"
            style={[styles.input, styles.addInput]}
            returnKeyType="done"
            onSubmitEditing={addTask}          />
          <Pressable onPress={addTask} style={styles.addBtn}>
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>
        <View style={styles.filters}>
          {['all','active','completed'].map(f => (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterPill, filter === f && 
tyles.filterPillActive]}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f[0].toUpperCase()+f.slice(1)}
              </Text>
            </Pressable>          ))}        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={filtered.length ? styles.list : styles.listEmpty}
          ListEmptyComponent={<Text style={styles.emptyText}>No tasks yet. Add one above!</Text>}
          keyboardShouldPersistTaps="handled"        />
      </KeyboardAvoidingView>
    </SafeAreaView>  );	}
const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#0b0b0f'},
  header: {paddingHorizontal: 20, paddingTop: 75, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  title: {fontSize: 35, fontWeight: '800', color: 'white'},
  clearBtn: {paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#1f2937'},
  clearText: {color: 'white', fontWeight: '600', fontSize: 12, opacity: 0.8},
  addBar: {flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 10},
  input: {backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16},
  addInput: {flex: 1},
  addBtn: {backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  addBtnText: {color: 'white', fontWeight: '700'},
  filters: {flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 6, gap: 8},
  filterPill: {paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#111827'},
  filterPillActive: {backgroundColor: '#2563eb'},
  filterText: {color: 'white', opacity: 0.8, fontWeight: '600'},
  filterTextActive: {opacity: 1},
  list: {padding: 16, gap: 10},
  listEmpty: {flexGrow: 1, alignItems: 'center', justifyContent: 'center'},
  emptyText: {color: 'white', opacity: 0.6},
  row: {flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#111827', borderRadius: 14, gap: 12},
  rowDone: {opacity: 0.6},
  checkbox: {width: 26, height: 26, borderRadius: 7, borderWidth: 2, borderColor: '#374151', alignItems: 'center', justifyContent: 'center'},
  checkboxOn: {backgroundColor: '#22c55e', borderColor: '#22c55e'},
  checkboxTick: {color: 'white', fontWeight: '800'},
  rowCenter: {flex: 1},
  taskText: {color: 'white', fontSize: 16},
  taskTextDone: {textDecorationLine: 'line-through', color: '#d1d5db'},
  actions: {flexDirection: 'row', gap: 8},
  actionBtn: {paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: '#1f2937'},
  deleteBtn: {backgroundColor: '#ef4444'},
  saveBtn: {backgroundColor: '#22c55e'},
  cancelBtn: {backgroundColor: '#6b7280'},
  actionText: {color: 'white', fontWeight: '700'},
  editInput: {minWidth: 160, backgroundColor: 'white'},	});
