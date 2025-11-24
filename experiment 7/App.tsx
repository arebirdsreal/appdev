import * as React from 'react';
import {useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  View,
  Platform,
  StyleSheet,
} from 'react-native';
import {
  Provider as PaperProvider,
  TextInput,
  Button,
  RadioButton,
  Checkbox,
  Text,
  HelperText,
  Divider,
} from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';

export default function App() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState<string>('BTech');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [experience, setExperience] = useState<number>(0);
  const [agree, setAgree] = useState<boolean>(false);

  const emailInvalid = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email);
  const phoneInvalid =
    phone.length > 0 && !/^\d{10}$/.test(phone.replace(/\D/g, ''));

  const onSubmit = () => {
    // basic validations
    if (!fullName.trim()) {
      Alert.alert('Missing info', 'Please enter your full name.');
      return;
    }
    if (!email.trim() || emailInvalid) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || phoneInvalid) {
      Alert.alert('Invalid phone', 'Enter a 10-digit phone number.');
      return;
    }
    if (!dob) {
      Alert.alert('Missing DOB', 'Please select your date of birth.');
      return;
    }
    if (!agree) {
      Alert.alert('Terms not accepted', 'Please accept the terms to proceed.');
      return;
    }

    // success
    Alert.alert(
      'Registration Submitted 🎉',
      `Name: ${fullName}
Email: ${email}
Phone: ${phone}
Course: ${course}
Gender: ${gender}
DOB: ${dob.toDateString()}
Experience: ${experience.toFixed(1)} yrs`,);};
  const onChangeDob = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) setDob(selected);};
  return (
    <PaperProvider>
      <SafeAreaView style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant="headlineMedium" style={styles.heading}>
            Student Profile / Registration</Text>
          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            mode="outlined"
            style={styles.input}/>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
            error={emailInvalid}/>
          {emailInvalid && (
            <HelperText type="error" visible={emailInvalid}>
              Please enter a valid email (e.g., name@domain.com)
            </HelperText>)}
          <TextInput
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            mode="outlined"
            style={styles.input}
            error={phoneInvalid}/>
          {phoneInvalid && (
            <HelperText type="error" visible={phoneInvalid}>
              Enter a 10-digit number
            </HelperText>)}
          {/* Dropdown (Course) */}
          <Text style={styles.label}>Course</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={course}
              onValueChange={setCourse}
              dropdownIconColor="#6b6b6b">
              <Picker.Item label="B.Tech" value="BTech" />
              <Picker.Item label="M.Tech" value="MTech" />
              <Picker.Item label="MBA" value="MBA" />
              <Picker.Item label="MCA" value="MCA" />
              <Picker.Item label="BSc" value="BSc" />
            </Picker>
          </View>
          {/* Date Picker */}
          <Text style={styles.label}>Date of Birth</Text>
          <View style={styles.dateRow}>
            <TextInput
              mode="outlined"
              value={dob ? dob.toDateString() : ''}
              placeholder="Select date"
              editable={false}
              style={[styles.input, {flex: 1, marginRight: 8}]}/>
            <Button
              mode="contained"
              onPress={() => setShowDatePicker(true)}
              style={{alignSelf: 'center'}}>
              Pick Date
            </Button>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={dob ?? new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeDob}
              maximumDate={new Date()}/>)}
          {/* Radio Buttons (Gender) */}
          <Text style={[styles.label, {marginTop: 16}]}>Gender</Text>
          <RadioButton.Group
            onValueChange={val => setGender(val as any)}
            value={gender}>
            <View style={styles.radioRow}>
              <RadioButton value="male" />
              <Text style={styles.radioLabel}>Male</Text>
              <RadioButton value="female" />
              <Text style={styles.radioLabel}>Female</Text>
              <RadioButton value="other" />
              <Text style={styles.radioLabel}>Other</Text></View>
          </RadioButton.Group>
          {/* Slider (Years of experience / skills level) */}
          <Text style={[styles.label, {marginTop: 16}]}>
            Coding Experience (years): {experience.toFixed(1)}
          </Text>
          <Slider
            style={{width: '100%'}}
            minimumValue={0}
            maximumValue={10}
            step={0.1}
            value={experience}
            onValueChange={setExperience}
            minimumTrackTintColor="#6200ee"
            maximumTrackTintColor="#bdbdbd"/>
          {/* Checkbox (Terms) */}
          <View style={styles.checkboxRow}>
            <Checkbox.Item
              label="I agree to the Terms & Privacy Policy"
              status={agree ? 'checked' : 'unchecked'}
              onPress={() => setAgree(a => !a)}
              position="leading"   // puts the box before the text
              />
          </View>


          <Divider style={{marginVertical: 16}} />
          <Button mode="contained" onPress={onSubmit}>
            Submit
          </Button>
          <Button
            mode="text"
            style={{marginTop: 8}}
            onPress={() => {
              setFullName('');
              setEmail('');
              setPhone('');
              setCourse('BTech');
              setGender('male');
              setDob(null);
              setExperience(0);
              setAgree(false);}}>
            Reset
          </Button>
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>);}
const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,},
  heading: {
    marginBottom: 12,
    textAlign: 'center',},
  input: {
    marginBottom: 12,},
  label: {
    marginBottom: 6,
    color: '#555',
    fontWeight: '600',},
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#c7c7c7',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',},
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',},
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',},
  radioLabel: {
    marginRight: 16,},
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,},});
