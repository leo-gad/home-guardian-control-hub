
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const isInitializedRef = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let sensorUnsubscribe: (() => void) | null = null;
    let deviceUnsubscribe: (() => void) | null = null;

    const initializeListeners = async () => {
      try {
        // Listen to real-time database for sensor data (temperature, humidity)
        const sensorRef = ref(database, '/');
        sensorUnsubscribe = onValue(sensorRef, (snapshot) => {
          try {
            const sensorData = snapshot.val();
            if (sensorData) {
              setData(prev => ({
                ...prev,
                temperature: sensorData.temperature || prev.temperature,
                humidity: sensorData.humidity || prev.humidity,
                motion: sensorData.motion || prev.motion,
              }));
              
              if (!isInitializedRef.current) {
                setLoading(false);
                isInitializedRef.current = true;
              }
            }
          } catch (err) {
            console.error('Error fetching sensor data:', err);
            setError('Failed to fetch sensor data');
          }
        });

        // Listen to Firestore for device states (controllable devices)
        deviceUnsubscribe = firestoreAPI.onDeviceStatesChange((deviceData) => {
          try {
            setData(prev => ({
              ...prev,
              door: deviceData.door ?? prev.door,
              window: deviceData.window ?? prev.window,
              lamp: deviceData.lamp ?? prev.lamp,
              lastUpdated: deviceData.lastUpdated || new Date().toISOString()
            }));
            
            if (!isInitializedRef.current) {
              setLoading(false);
              isInitializedRef.current = true;
            }
          } catch (err) {
            console.error('Error fetching device data:', err);
            setError('Failed to fetch device data');
          }
        });

      } catch (err) {
        setError('Failed to initialize data listeners');
        setLoading(false);
      }
    };

    initializeListeners();

    return () => {
      if (sensorUnsubscribe) sensorUnsubscribe();
      if (deviceUnsubscribe) deviceUnsubscribe();
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const updateDevice = useCallback(async (device: string, value: boolean) => {
    // Optimistic update for immediate UI feedback
    setData(prev => ({
      ...prev,
      [device]: value,
      lastUpdated: new Date().toISOString()
    }));

    try {
      // Batch updates with debouncing
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(async () => {
        try {
          // Update both Firestore and Real-time database
          await Promise.all([
            firestoreAPI.updateDeviceState(device, value),
            set(ref(database, `/${device}`), value),
            set(ref(database, '/lastUpdated'), new Date().toISOString())
          ]);
        } catch (err) {
          console.error('Failed to update device:', err);
          // Revert optimistic update on error
          setData(prev => ({
            ...prev,
            [device]: !value
          }));
          throw err;
        }
      }, 100); // 100ms debounce

    } catch (err) {
      console.error('Failed to update device:', err);
      setError('Failed to update device');
      throw err;
    }
  }, []);

  return { data, loading, error, updateDevice };
};
