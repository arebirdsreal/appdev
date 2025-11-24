import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // READ (listen for changes)
  useEffect(() => {
    const unsub = firestore()
      .collection('users')
      .orderBy('name')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(data);
      }, err => console.error(err));
    return () => unsub();
  }, []);

  const clearForm = () => { setName(''); setEmail(''); setAge(''); setEditingId(null); };

  // CREATE
  const onAdd = async () => {
    if (!name || !email || !age) return Alert.alert('Please fill all fields');
    try {
      await firestore().collection('users').add({ name, email, age: Number(age) });
      clearForm();
    } catch (e) {
      Alert.alert('Error adding user', e.message);
    }
  };

  // UPDATE
  const onSaveEdit = async () => {
    try {
      await firestore().collection('users').doc(editingId).update({ name, email, age: Number(age) });
      clearForm();
    } catch (e) {
      Alert.alert('Error updating user', e.message);
    }
  };

  // DELETE
  const onDelete = async (id) => {
    try {
      await firestore().collection('users').doc(id).delete();
    } catch (e) {
      Alert.alert('Error deleting user', e.message);
    }
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setEmail(item.email);
    setAge(String(item.age));
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text>{item.email}</Text>
      <Text>Age: {item.age}</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.btn}><Text>Edit</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.btnDanger}><Text>Delete</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Firestore CRUD</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input}/>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input}/>
      <TextInput placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric" style={styles.input}/>
      {editingId ? (
        <View style={styles.row}>
          <Button title="Save" onPress={onSaveEdit}/>
          <View style={{ width: 10 }}/>
          <Button title="Cancel" color="gray" onPress={clearForm}/>
        </View>
      ) : (
        <Button title="Add User" onPress={onAdd}/>
      )}
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={{ marginTop: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'flex-start', gap: 10, marginTop: 10 },
  btn: { padding: 8, backgroundColor: '#eee', borderRadius: 6 },
  btnDanger: { padding: 8, backgroundColor: '#f8d7da', borderRadius: 6 },
  title: { fontWeight: 'bold', fontSize: 16 },
});
