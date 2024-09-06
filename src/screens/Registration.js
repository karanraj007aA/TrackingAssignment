import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, TouchableOpacity, Text } from 'react-native';
import realm from '../../realm';

const RegistrationScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const register = () => {
    // Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    // Check if user already exists
    const existingUser = realm.objects('User').filtered('username == $0', username);
    if (existingUser.length > 0) {
      Alert.alert('Error', 'User already exists!');
      return;
    }

    // Register the new user by saving it in Realm
    realm.write(() => {
      realm.create('User', {
        id: Date.now().toString(), // Generate unique integer ID
        username,
        password,
        checkInTime: null, // Initialize with no check-in time
        checkOutTime: null, // Initialize with no check-out time
      });
    });

    // Show success alert and navigate to the login screen
    Alert.alert('Success', 'User registered successfully');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor={'black'}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        placeholderTextColor={'black'}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor={'black'}
        value={confirmPassword}
        secureTextEntry
        onChangeText={setConfirmPassword}
      />
      <Button title="Register" onPress={register} />
      <TouchableOpacity
        style={{
          marginTop: 20,
          alignItems: 'center',
        }}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={{color:'black'}} >{'Already Registered? Click here.'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    color:'black'
  },
});

export default RegistrationScreen;
