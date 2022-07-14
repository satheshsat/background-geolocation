import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet, Text, View, Button } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Permissions from 'expo-permissions';
import MapView, { Marker } from 'react-native-maps';
import { useEffect, useRef, useState } from 'react';

const LOCATION_TRACKING = 'location-tracking';

export default function App() {
  const map = useRef<MapView>(null);
    const [location, setLocation] = useState<Location.LocationObject>();
    const startLocationTracking = async () => {
        await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 5000,
          distanceInterval: 0,
          foregroundService: {
            notificationTitle: 'Background Tracking',
            notificationBody: 'Enabled'
          },
          pausesUpdatesAutomatically: false,
        });
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(
          LOCATION_TRACKING
        );
        console.log('tracking started?', hasStarted);
      };
    
      const stopLocationTracking = () => {
        TaskManager.unregisterTaskAsync(LOCATION_TRACKING);
      };
    
      useEffect(() => {
        const config = async () => {
          let res = await Permissions.askAsync(Permissions.LOCATION);
          if (res.status !== 'granted') {
            console.log('Permission to access location was denied');
          } else {
            console.log('Permission to access location granted');
            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            map.current?.animateCamera({
                center: { latitude: location?.coords.latitude, longitude: location?.coords.longitude },
                zoom: 18,
                heading: 0,
                pitch: 0,
                altitude: 5
            });
          }
        };
        config();
      }, []);

  return (
      <View>
        <MapView
        ref={map}
        style={styles.map}
        initialRegion={{
          latitude: 43.0741704,
          longitude: -89.3809802,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        >
            {location?.coords.latitude && location?.coords.longitude ? 
          <Marker
            coordinate={location?.coords}
          ></Marker> : null}
        </MapView>
        <View style={styles.footer}>
            <Button title="Start Tracking" onPress={startLocationTracking} />
            <Button title="Stop Tracking" onPress={stopLocationTracking} />
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
  //   position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  footer: {
      position: 'absolute',
      height: 40,
      left: 0, 
      top: Dimensions.get('window').height - 70, 
      // bottom: 0,
      width: Dimensions.get('window').width,
  }
});

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }: any) => {
  if (error) {
    console.log('LOCATION_TRACKING task ERROR:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    let lat = locations[0].coords.latitude;
    let long = locations[0].coords.longitude;
    let alt = locations[0].coords.altitude;
    console.log(
      `${new Date(Date.now()).toLocaleString()}: ${lat},${long},${alt}`
    );
  }
});
