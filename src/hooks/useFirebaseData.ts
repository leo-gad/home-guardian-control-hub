
import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '@/lib/firebase';

interface DeviceData {
  temperature: number;
  humidity: number;
  motion: boolean;
  door: boolean;
  window: boolean;
  lamp: boolean;
  lastUpdated: string;
}

export const useFirebaseData = () => {
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
    const dataRef = ref(database, '/');
    
    const unsubscribe = onValue(dataRef, (snapshot) => {
      try {
        const firebaseData = snapshot.val();
        if (firebaseData) {
          setData({
            temperature: firebaseData.temperature || 25,
            humidity: firebaseData.humidity || 60,
            motion: firebaseData.motion || false,
            door: firebaseData.door || false,
            window: firebaseData.window || false,
            lamp: firebaseData.lamp || false,
            lastUpdated: firebaseData.lastUpdated || new Date().toISOString()
          });
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    }, (error) => {
      setError(error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateDevice = async (device: string, value: boolean) => {
    try {
      await set(ref(database, `/${device}`), value);
      await set(ref(database, '/lastUpdated'), new Date().toISOString());
    } catch (err) {
      setError('Failed to update device');
    }
  };

  return { data, loading, error, updateDevice };
};
