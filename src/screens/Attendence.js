import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Button,ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import realm from '../../realm';
import GetLocation from 'react-native-get-location';
import Geolib from 'geolib';
import HomeScreen from './Homescreen';

const Attendance = ({ route, navigation }) => {
  const { userId } = route.params; 
  const [user, setUser] = useState(null);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [userMarkers, setUserMarkers] = useState([]);

  const loadMarkers = async () => {
    try {
      const markersString = await AsyncStorage.getItem('userMarkers');
      if (markersString) {
        const markers = JSON.parse(markersString);
        setUserMarkers(markers);
        
      }
    } catch (error) {
      console.warn('Error loading markers:', error);
    }
  };

  const loadUserData = () => {
    const foundUser = realm.objects('User').filtered('id == $0', userId)[0];
    if (foundUser) {
      setUser(foundUser);
      setCheckInTime(foundUser.checkInTime || '');
      setCheckOutTime(foundUser.checkOutTime || '');
    }
  };

  useEffect(() => {
    loadMarkers();
    
    loadUserData();

    const startLocationMonitoring = () => {
      locationInterval = setInterval(async () => {
        try {
          const location =  getCurrentLocation();
          if (location) {
           
            if (isNearMarker(location)) {
              console.log('Near marker and not checked in, checking in...');
              handleCheckIn();
            } else if (checkInTime && !checkOutTime && isNearMarker(location)) {
              console.log('Near marker and checked in, checking out...');
              handleCheckOut();
            }
          }
        } catch (error) {
          console.warn('Error during location monitoring:', error);
        }
      },  5*60 * 1000); 
    };

    startLocationMonitoring();

    return () => {
      if (locationInterval) {
        clearInterval(locationInterval); 
      }
    };
  }, [userId, checkInTime, checkOutTime, userMarkers]);

  const getCurrentLocation = async () => {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000, 
      });
      return location;
    } catch (error) {
      console.warn('Error getting location:', error);
  
      switch (error.code) {
        case 'CANCELLED':
          console.log('Location request was cancelled by the user or the system.');
          break;
        case 'UNAVAILABLE':
          console.log('Location services are unavailable or disabled.');
          break;
        case 'TIMEOUT':
          console.log('Location request timed out.');
          break;
        case 'UNAUTHORIZED':
          console.log('Permission to access location was denied.');
          break;
        default:
          console.log('An unknown error occurred while getting location.');
      }
  
      return null;
    }
  };
  

  const isNearMarker = (location) => {
    const threshold = 10; 
    console.log('near marker');
    handleCheckIn();
    return userMarkers.some(marker =>
      Geolib.getDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: marker.latitude, longitude: marker.longitude }
      ) <= threshold
    );
  };

  

  const handleCheckIn = () => {
    const currentTime = new Date().toISOString();
    realm.write(() => {
      user.checkInTime = currentTime;
    });
    setCheckInTime(currentTime);
    Alert.alert('Check-In Successful', `Checked in at ${currentTime}`);
  };

  const handleCheckOut = () => {
    const currentTime = new Date().toISOString();
    realm.write(() => {
      user.checkOutTime = currentTime;
    });
    setCheckOutTime(currentTime);
    Alert.alert('Check-Out Successful', `Checked out at ${currentTime}`);
  };

  const handleLogout = async () => {
    try {
      realm.write(() => {
        // Update the user record with current check-out time (if check-in time exists)
        const foundUser = realm.objects('User').filtered('id == $0', userId)[0];
        if (foundUser && foundUser.checkInTime) {
          foundUser.checkOutTime = new Date().toISOString();
          setCheckOutTime(foundUser.checkOutTime);
        }
      });

      // Clear user token from AsyncStorage
      await AsyncStorage.removeItem('userToken');
      console.log('Token removed successfully');

      // Navigate to the login screen
      navigation.navigate('Login');
    } catch (error) {
      console.log('Error during logout', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.username}>User: {user?.username}</Text>
      <Text style={styles.timeText}>
        {checkInTime ? `Check-In Time: ${checkInTime}` : 'Not Checked In Yet'}
      </Text>
      <Text style={styles.timeText}>
        {checkOutTime ? `Check-Out Time: ${checkOutTime}` : 'Not Checked Out Yet'}
      </Text>

      <View style={{ flexDirection: 'row', paddingHorizontal: 6, columnGap: 5 }}>
        <TouchableOpacity
          style={[styles.button, checkInTime && styles.disabledButton]}
          onPress={handleCheckIn}
          disabled={!!checkInTime}
        >
          <Text style={styles.buttonText}>{checkInTime ? 'Checked In' : 'Check In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, (!checkInTime || checkOutTime) && styles.disabledButton]}
          onPress={handleCheckOut}
          disabled={!checkInTime || !!checkOutTime}
        >
          <Text style={styles.buttonText}>{checkOutTime ? 'Checked Out' : 'Check Out'}</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Button title="Logout" onPress={handleLogout} />
      </View>
      <View>
        <View style={{ height: 600 }}>
          <HomeScreen />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 6,
    rowGap: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  timeText: {
    color: 'black',
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: 'skyblue',
    width: '50%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

let locationInterval; // Interval handle for cleanup

export default Attendance;
