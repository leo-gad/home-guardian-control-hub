
import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    const userRef = ref(database, `users/${currentUser.id}/devices`);
    
    const unsubscribe = onValue(userRef, (snapshot) => {
      try {
        const firebaseData = snapshot.val();
        console.log('Firebase user data received:', firebaseData);
        
        if (firebaseData) {
          setData({
            temperature: firebaseData.temperature || 25,
            humidity: firebaseData.humidity || 60,
            motion: firebaseData.motion1 || false,
            door: firebaseData.door1 || false,
            window: firebaseData.window1 || false,
            lamp: firebaseData.lamp1 || false,
            lastUpdated: firebaseData.lastUpdated || new Date().toISOString()
          });
        }
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch data');
        setLoading(false);
      }
    }, (error) => {
      console.error('Firebase error:', error);
      setError(error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const updateDevice = async (device: string, value: boolean) => {
    if (!currentUser?.id) {
      throw new Error('No user logged in');
    }

    try {
      console.log(`Updating ${device} to ${value} for user ${currentUser.id}`);
      
      // Map device names to Firebase structure
      const deviceMapping: { [key: string]: string } = {
        'lamp': 'lamp1',
        'door': 'door1',
        'window': 'window1',
        'motion': 'motion1'
      };

      const firebaseDeviceName = deviceMapping[device] || device;
      
      // Update the device state for the specific user
      await set(ref(database, `users/${currentUser.id}/devices/${firebaseDeviceName}`), value);
      
      // Update the lastUpdated timestamp
      await set(ref(database, `users/${currentUser.id}/devices/lastUpdated`), new Date().toISOString());
      
      // Optimistic update for immediate UI feedback
      setData(prev => ({
        ...prev,
        [device]: value,
        lastUpdated: new Date().toISOString()
      }));
      
      console.log(`Successfully updated ${device} for user ${currentUser.id}`);
    } catch (err) {
      console.error('Failed to update device:', err);
      setError('Failed to update device');
      throw err;
    }
  };

  return { data, loading, error, updateDevice };
};
