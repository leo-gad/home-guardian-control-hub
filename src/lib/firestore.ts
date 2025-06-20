
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDDO8wSBhlOLg5b7QpGy8tQ8yKE8zJxQ5M",
  authDomain: "control-41a78.firebaseapp.com",
  databaseURL: "https://dht11-9aca0-default-rtdb.firebaseio.com",
  projectId: "control-41a78",
  storageBucket: "control-41a78.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const database = getDatabase(app);

// Firestore helper functions
export const firestoreAPI = {
  // Users
  async getUsers() {
    const usersSnapshot = await getDocs(collection(firestore, 'users'));
    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createUser(userData: any) {
    const userRef = doc(collection(firestore, 'users'));
    await setDoc(userRef, { ...userData, createdAt: new Date().toISOString() });
    return userRef.id;
  },

  async updateUser(userId: string, userData: any) {
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, userData);
  },

  async deleteUser(userId: string) {
    const userRef = doc(firestore, 'users', userId);
    await deleteDoc(userRef);
  },

  // Homes
  async getHomes() {
    const homesSnapshot = await getDocs(collection(firestore, 'homes'));
    return homesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createHome(homeData: any) {
    const homeRef = doc(collection(firestore, 'homes'));
    await setDoc(homeRef, { ...homeData, createdAt: new Date().toISOString() });
    return homeRef.id;
  },

  async updateHome(homeId: string, homeData: any) {
    const homeRef = doc(firestore, 'homes', homeId);
    await updateDoc(homeRef, homeData);
  },

  async deleteHome(homeId: string) {
    const homeRef = doc(firestore, 'homes', homeId);
    await deleteDoc(homeRef);
  },

  // Device states
  async getDeviceStates() {
    const deviceRef = doc(firestore, 'devices', 'states');
    const deviceSnap = await getDoc(deviceRef);
    return deviceSnap.exists() ? deviceSnap.data() : {};
  },

  async updateDeviceState(deviceName: string, state: boolean) {
    const deviceRef = doc(firestore, 'devices', 'states');
    await updateDoc(deviceRef, {
      [deviceName]: state,
      lastUpdated: new Date().toISOString()
    });
  },

  // Listen to device state changes
  onDeviceStatesChange(callback: (data: any) => void) {
    const deviceRef = doc(firestore, 'devices', 'states');
    return onSnapshot(deviceRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  }
};
