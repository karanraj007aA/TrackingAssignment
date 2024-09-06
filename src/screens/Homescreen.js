import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, PermissionsAndroid, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import GetLocation from 'react-native-get-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useLocationStore from '../redux/store';
import LocationHistory from './LocationHistory';
import realm from '../../realm';

const HomeScreen = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const [userMarkers, setUserMarkers] = useState([]);
  const addLocation = useLocationStore((state) => state.addLocation);


  
  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'Please allow the Location Permission to continue',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            fetchCurrentLocation();
            startLocationTracking();
          } else {
            Alert.alert('Permission Denied', 'Location permission denied');
            setLoading(false);
          }
        } catch (err) {
          console.warn(err);
          setLoading(false);
        }
      } else if (Platform.OS === 'ios') {
        fetchCurrentLocation();
        startLocationTracking();
      }
    };

    requestLocationPermission();
    
    const fetchMarkers = async () => {
      const markersString = await AsyncStorage.getItem('userMarkers');
      if (markersString) {
        setUserMarkers(JSON.parse(markersString));
      }
    };

    fetchMarkers();

    return () => {
      clearInterval(locationInterval);
    };
  }, []);

  const fetchCurrentLocation = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
    .then(location => {
      setLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      addLocation(location); 
      setLoading(false);
    })
    .catch(error => {
      console.warn('Error getting location:', error);
      Alert.alert('Error', 'Unable to get location');
      setLoading(false);
    });
  };

  const startLocationTracking = () => {
    locationInterval = setInterval(() => {
      GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      })
      .then(location => {
        addLocation(location);
      })
      .catch(error => {
        console.warn('Error getting location:', error);
      });
    }, 5 * 60 * 1000); 
  };

  const handleMapPress = async (e) => {
    const newMarker = {
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    };
    const updatedMarkers = [...userMarkers, newMarker];
    setUserMarkers(updatedMarkers);
    
    await AsyncStorage.setItem('userMarkers', JSON.stringify(updatedMarkers));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: 'black' }}>Loading location...</Text>
      </View>
    );
  }

  const initialRegion = location || {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <View style={styles.maps}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          onPress={handleMapPress} 
        >
          {location && (
            <Marker coordinate={location} title="Your Location" />
          )}
          {userMarkers.map((marker, index) => (
            <Marker
              key={`user-marker-${index}`}
              coordinate={marker}
              title={`User Marker ${index + 1}`}
            />
          ))}
        </MapView>
      </View>
      <LocationHistory />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  maps: {
    height: '60%',
  },
});

let locationInterval;

export default HomeScreen;
