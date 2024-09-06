import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Platform, PermissionsAndroid } from 'react-native';
import GetLocation from 'react-native-get-location';
import useLocationStore from '../redux/store';

const LocationHistory = () => {
  const [intervalId, setIntervalId] = useState(null);
  const locations = useLocationStore((state) => state.locations);
  const addLocation = useLocationStore((state) => state.addLocation);

  const getCurrentLocation = async () => {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      });
      addLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp,
      });
    } catch (error) {
      console.warn('Error getting location:', error);
      Alert.alert('Error', 'Unable to get location');
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Please allow location permission to track your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          Alert.alert('Permission Denied', 'Location permission denied');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else if (Platform.OS === 'ios') {
      return true;
    }
    return false;
  };

  useEffect(() => {
    const startLocationTracking = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      await getCurrentLocation();

      const id = setInterval(async () => {
        await getCurrentLocation();
      }, 5 * 60 * 1000); 

      return () => clearInterval(id);
    };

    startLocationTracking();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const renderItem = useCallback(({ item }) => {
    if (!item || !item.timestamp) {
      console.warn('Invalid item:', item);
      return null;
    }

    return (
      <View style={styles.item}>
        <Text style={styles.info}>Latitude: {item.latitude}</Text>
        <Text style={styles.info}>Longitude: {item.longitude}</Text>
        <Text style={styles.info}>Timestamp: {new Date(item.timestamp).toLocaleString()}</Text>
      </View>
    );
  }, []);

  if (!locations || locations.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No location data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Location History: tracks every 5 minutes</Text>
      <FlatList
        data={locations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        scrollEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderWidth:1
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  info: {
    color: 'black',
  },
});

export default LocationHistory;
