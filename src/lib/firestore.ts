
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDDO8wSBhlOLg5b7QpGy8tQ8yKE8zJxQ5M",
  authDomain: "control-41a78.firebaseapp.com",
  databaseURL: "https://control-41a78-default-rtdb.firebaseio.com",
  projectId: "control-41a78",
  storageBucket: "control-41a78.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
