import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/Login';
import RegistrationScreen from './src/screens/Registration';

import Attendence from './src/screens/Attendence';
import HomeScreen from './src/screens/Homescreen';
import LocationHistory from './src/screens/LocationHistory';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Registration" >
       <Stack.Screen name='Login' component={LoginScreen}/>
       <Stack.Screen name='Registration' component={RegistrationScreen}/>
       <Stack.Screen name='HomeScreen' component={HomeScreen}/>
      <Stack.Screen name='LocationHistory'component={LocationHistory}/>
       <Stack.Screen name='Attendence' component={Attendence}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;