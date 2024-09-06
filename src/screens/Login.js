import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import realm from '../../realm';


const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      // Find the user in the Realm database
      const user = realm.objects('User').filtered('username == $0 && password == $1', username, password);

      console.log('User value is --->', user);

      if (user.length === 0) {
        Alert.alert('Error', 'Invalid credentials!');
        return;
      }

      const token = 'mock-jwt-token';
      await AsyncStorage.setItem('userToken', token);
      console.log('Token saved successfully');

      const savedToken = await AsyncStorage.getItem('userToken');
      console.log('Retrieved token:', savedToken);

      navigation.navigate('Attendence', { userId: user[0].id });
    } catch (error) {
      console.log('Error during login:', error);
      Alert.alert('Error', 'An error occurred during login.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <TextInput
        placeholder="Username"
        value={username}
        placeholderTextColor={'black'}
        onChangeText={setUsername}
        style={{ marginBottom: 12, borderBottomWidth: 1, padding: 8, color: 'black' }}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={'black'}
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{ marginBottom: 12, borderBottomWidth: 1, padding: 8, color: 'black' }}
      />
      <Button title="Login" onPress={login} />
    </View>
  );
};

export default LoginScreen;
