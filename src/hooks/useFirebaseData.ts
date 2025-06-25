
import { useState, useEffect, useRef } from 'react';
import { ref, onValue, set, off } from 'firebase/database';
import { database } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface DeviceData {
  temperature: number;
  humidity: number;
  motion: boolean;
  door: boolean;
  window: boolean;
  lamp: boolean;
  lastUpdated: string;
}

interface SensorData {
  temperature: number;
  humidity: number;
  temperatureAlert: boolean;
  humidityAlert: boolean;
  motionAlert: boolean;
  doorAlert: boolean;
  windowAlert: boolean;
}

const CACHE_KEY = 'firebase_device_data';
const SENSOR_CACHE_KEY = 'firebase_sensor_data';

export const useFirebaseData = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState<DeviceData>({
    temperature: 25,
    humidity: 60,
    motion: false,
    door: false,
    window: false,
    lamp: false,
    lastUpdated: new Date().toISOString()
  });
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 25,
    humidity: 60,
    temperatureAlert: false,
    humidityAlert: false,
    motionAlert: false,
    doorAlert: false,
    windowAlert: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load cached data on component mount
  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cachedData = localStorage.getItem(`${CACHE_KEY}_${currentUser?.id}`);
        const cachedSensorData = localStorage.getItem(`${SENSOR_CACHE_KEY}_${currentUser?.id}`);
        
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setData(parsedData);
          console.log('Loaded cached device data:', parsedData);
        }
        
        if (cachedSensorData) {
          const parsedSensorData = JSON.parse(cachedSensorData);
          setSensorData(parsedSensorData);
          console.log('Loaded cached sensor data:', parsedSensorData);
        }
      } catch (err) {
        console.error('Error loading cached data:', err);
      }
    };

    if (currentUser?.id) {
      loadCachedData();
    }
  }, [currentUser?.id]);

  // Save data to cache whenever it changes
  const saveToCache = (deviceData: DeviceData, sensorData?: SensorData) => {
    try {
      if (currentUser?.id) {
        localStorage.setItem(`${CACHE_KEY}_${currentUser.id}`, JSON.stringify(deviceData));
        if (sensorData) {
          localStorage.setItem(`${SENSOR_CACHE_KEY}_${currentUser.id}`, JSON.stringify(sensorData));
        }
        console.log('Saved device and sensor data to cache');
      }
    } catch (err) {
      console.error('Error saving to cache:', err);
    }
  };

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    const userRef = ref(database, `users/${currentUser.id}`);
    
    const unsubscribe = onValue(userRef, (snapshot) => {
      try {
        const firebaseData = snapshot.val();
        console.log('Firebase user data received:', firebaseData);
        
        if (firebaseData) {
          // Handle device data
          const newData = {
            temperature: firebaseData.sensors?.temperature || firebaseData.devices?.temperature || 25,
            humidity: firebaseData.sensors?.humidity || firebaseData.devices?.humidity || 60,
            motion: firebaseData.devices?.motion1 || false,
            door: firebaseData.devices?.door1 || false,
            window: firebaseData.devices?.window1 || false,
            lamp: firebaseData.devices?.lamp1 || false,
            lastUpdated: firebaseData.devices?.lastUpdated || new Date().toISOString()
          };
          
          // Handle sensor alert data
          const newSensorData = {
            temperature: firebaseData.sensors?.temperature || 25,
            humidity: firebaseData.sensors?.humidity || 60,
            temperatureAlert: firebaseData.sensors?.temperatureAlert || false,
            humidityAlert: firebaseData.sensors?.humidityAlert || false,
            motionAlert: firebaseData.sensors?.motionAlert || false,
            doorAlert: firebaseData.sensors?.doorAlert || false,
            windowAlert: firebaseData.sensors?.windowAlert || false
          };
          
          setData(newData);
          setSensorData(newSensorData);
          saveToCache(newData, newSensorData);
          setIsConnected(true);
        }
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch data');
        setIsConnected(false);
        setLoading(false);
      }
    }, (error) => {
      console.error('Firebase error:', error);
      setError(error.message);
      setIsConnected(false);
      setLoading(false);
    });

    // Store the unsubscribe function
    unsubscribeRef.current = unsubscribe;

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [currentUser?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const updateDevice = async (device: string, value: boolean) => {
    if (!currentUser?.id) {
      throw new Error('No user logged in');
    }

    try {
      console.log(`Updating ${device} to ${value} for user ${currentUser.id}`);
      
      const deviceMapping: { [key: string]: string } = {
        'lamp': 'lamp1',
        'door': 'door1',
        'window': 'window1',
        'motion': 'motion1'
      };

      const firebaseDeviceName = deviceMapping[device] || device;
      
      // Optimistic update for immediate UI feedback
      const optimisticData = {
        ...data,
        [device]: value,
        lastUpdated: new Date().toISOString()
      };
      setData(optimisticData);
      saveToCache(optimisticData, sensorData);
      
      // Update Firebase
      await set(ref(database, `users/${currentUser.id}/devices/${firebaseDeviceName}`), value);
      await set(ref(database, `users/${currentUser.id}/devices/lastUpdated`), new Date().toISOString());
      
      setIsConnected(true);
      setError(null);
      console.log(`Successfully updated ${device} for user ${currentUser.id}`);
    } catch (err) {
      console.error('Failed to update device:', err);
      setError('Failed to update device');
      setIsConnected(false);
      
      // Revert optimistic update on error
      const cachedData = localStorage.getItem(`${CACHE_KEY}_${currentUser.id}`);
      if (cachedData) {
        try {
          setData(JSON.parse(cachedData));
        } catch (parseErr) {
          console.error('Error reverting to cached data:', parseErr);
        }
      }
      
      throw err;
    }
  };

  const updateSensorAlert = async (alertType: keyof SensorData, value: boolean) => {
    if (!currentUser?.id) {
      throw new Error('No user logged in');
    }

    try {
      console.log(`Updating ${alertType} alert to ${value} for user ${currentUser.id}`);
      
      // Optimistic update for immediate UI feedback
      const optimisticSensorData = {
        ...sensorData,
        [alertType]: value
      };
      setSensorData(optimisticSensorData);
      saveToCache(data, optimisticSensorData);
      
      // Update Firebase
      await set(ref(database, `users/${currentUser.id}/sensors/${alertType}`), value);
      
      setIsConnected(true);
      setError(null);
      console.log(`Successfully updated ${alertType} alert for user ${currentUser.id}`);
    } catch (err) {
      console.error('Failed to update sensor alert:', err);
      setError('Failed to update sensor alert');
      setIsConnected(false);
      
      // Revert optimistic update on error
      const cachedSensorData = localStorage.getItem(`${SENSOR_CACHE_KEY}_${currentUser.id}`);
      if (cachedSensorData) {
        try {
          setSensorData(JSON.parse(cachedSensorData));
        } catch (parseErr) {
          console.error('Error reverting to cached sensor data:', parseErr);
        }
      }
      
      throw err;
    }
  };

  return { 
    data, 
    sensorData,
    loading, 
    error, 
    updateDevice,
    updateSensorAlert,
    isConnected,
    lastUpdated: data.lastUpdated 
  };
};
