
import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '@/lib/firestore';
import { firestoreAPI } from '@/lib/firestore';

interface DeviceData {
  temperature: number;
  humidity: number;
  motion: boolean;
  door: boolean;
  window: boolean;
  lamp: boolean;
  lastUpdated: string;
}

export const useFirestoreData = () => {
  const [data, setData] = useState<DeviceData>({
    temperature: 25,
    humidity: 60,
    motion: false,
    door: false,
    window: false,
    lamp: false,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen to real-time database for sensor data (temperature, humidity)
    const sensorRef = ref(database, '/');
    const sensorUnsubscribe = onValue(sensorRef, (snapshot) => {
      try {
        const sensorData = snapshot.val();
        if (sensorData) {
          setData(prev => ({
            ...prev,
            temperature: sensorData.temperature || 25,
            humidity: sensorData.humidity || 60,
            motion: sensorData.motion || false,
          }));
        }
      } catch (err) {
        console.error('Error fetching sensor data:', err);
      }
    });

    // Listen to Firestore for device states (controllable devices)
    const deviceUnsubscribe = firestoreAPI.onDeviceStatesChange((deviceData) => {
      try {
        setData(prev => ({
          ...prev,
          door: deviceData.door || false,
          window: deviceData.window || false,
          lamp: deviceData.lamp || false,
          lastUpdated: deviceData.lastUpdated || new Date().toISOString()
        }));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch device data');
        setLoading(false);
      }
    });

    return () => {
      sensorUnsubscribe();
      deviceUnsubscribe();
    };
  }, []);

  const updateDevice = async (device: string, value: boolean) => {
    try {
      // Update both Firestore and Real-time database
      await firestoreAPI.updateDeviceState(device, value);
      await set(ref(database, `/${device}`), value);
      await set(ref(database, '/lastUpdated'), new Date().toISOString());
      
      // Update local state immediately for better UX
      setData(prev => ({
        ...prev,
        [device]: value,
        lastUpdated: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Failed to update device:', err);
      setError('Failed to update device');
      throw err;
    }
  };

  return { data, loading, error, updateDevice };
};
