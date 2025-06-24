
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from '@/lib/firestore';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  homeId?: string;
  password?: string;
  profileImage?: string;
}

interface Home {
  id: string;
  name: string;
  adminId: string;
  componentCount: {
    lamps: number;
    doors: number;
    windows: number;
    motionSensors: number;
  };
  users: string[]; // user IDs
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  homes: Home[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  changePassword: (newPassword: string) => void;
  createHome: (homeData: Omit<Home, 'id' | 'adminId' | 'users' | 'createdAt'>) => void;
  deleteHome: (homeId: string) => void;
  assignUserToHome: (userId: string, homeId: string) => Promise<void>;
  getCurrentUserHome: () => Home | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@home.com',
      role: 'admin',
      password: 'password123'
    },
    {
      id: '2', 
      name: 'John Doe',
      email: 'user@home.com',
      role: 'user',
      homeId: 'home1',
      password: 'password123'
    }
  ]);
  
  const [homes, setHomes] = useState<Home[]>([
    {
      id: 'home1',
      name: 'John\'s Smart Home',
      adminId: '1',
      componentCount: {
        lamps: 3,
        doors: 2,
        windows: 4,
        motionSensors: 2
      },
      users: ['2'],
      createdAt: new Date().toISOString()
    }
  ]);

  // Store user profile data in Firebase
  const storeUserInFirebase = async (user: User) => {
    try {
      const userProfileRef = ref(database, `userProfiles/${user.id}`);
      const userProfileData = {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        homeId: user.homeId || null,
        createdAt: new Date().toISOString()
      };
      
      await set(userProfileRef, userProfileData);
      console.log(`Stored user profile for ${user.name} in Firebase`);
    } catch (error) {
      console.error('Error storing user profile in Firebase:', error);
      throw error;
    }
  };

  // Store admin profile data in Firebase
  const storeAdminInFirebase = async (admin: User) => {
    try {
      const adminProfileRef = ref(database, `adminProfiles/${admin.id}`);
      const adminProfileData = {
        name: admin.name,
        email: admin.email,
        password: admin.password,
        role: admin.role,
        createdAt: new Date().toISOString()
      };
      
      await set(adminProfileRef, adminProfileData);
      console.log(`Stored admin profile for ${admin.name} in Firebase`);
    } catch (error) {
      console.error('Error storing admin profile in Firebase:', error);
      throw error;
    }
  };

  const createFirebaseUserStructure = async (userId: string, homeId: string, componentCount: Home['componentCount']) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      const user = users.find(u => u.id === userId);
      
      if (!user) return;

      // Create user data structure in Firebase
      const userData = {
        name: user.name,
        email: user.email,
        password: user.password,
        homeId: homeId,
        devices: {}
      };

      // Add devices based on component count
      for (let i = 1; i <= componentCount.lamps; i++) {
        userData.devices[`lamp${i}`] = false;
      }
      
      for (let i = 1; i <= componentCount.doors; i++) {
        userData.devices[`door${i}`] = false;
      }
      
      for (let i = 1; i <= componentCount.windows; i++) {
        userData.devices[`window${i}`] = false;
      }
      
      for (let i = 1; i <= componentCount.motionSensors; i++) {
        userData.devices[`motion${i}`] = false;
      }

      // Add environmental data
      userData.devices['temperature'] = 25;
      userData.devices['humidity'] = 60;
      userData.devices['lastUpdated'] = new Date().toISOString();

      await set(userRef, userData);
      
      // Also store user profile separately
      await storeUserInFirebase(user);
      
      console.log(`Created Firebase structure for user ${userId}`);
    } catch (error) {
      console.error('Error creating Firebase user structure:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.email === email);
    if (user && user.password === password) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Store admin profile in Firebase if it's an admin login
      if (user.role === 'admin') {
        await storeAdminInFirebase(user);
      }
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    const newUser = { ...userData, id: Date.now().toString() };
    setUsers(prev => [...prev, newUser]);
    
    // Store user profile in Firebase immediately
    await storeUserInFirebase(newUser);
    
    // If user has a homeId, create Firebase structure
    if (newUser.homeId) {
      const home = homes.find(h => h.id === newUser.homeId);
      if (home) {
        await createFirebaseUserStructure(newUser.id, newUser.homeId, home.componentCount);
      }
    }
  };

  const removeUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    
    // Remove user from users array
    setUsers(prev => prev.filter(u => u.id !== userId));
    
    // Remove user data from Firebase
    if (userToDelete) {
      const userRef = ref(database, `users/${userId}`);
      const userProfileRef = ref(database, `userProfiles/${userId}`);
      set(userRef, null).catch(console.error);
      set(userProfileRef, null).catch(console.error);
    }
    
    // If user has a home and is the only user, delete the home
    if (userToDelete?.homeId) {
      const userHome = homes.find(h => h.id === userToDelete.homeId);
      if (userHome && userHome.users.length === 1 && userHome.users[0] === userId) {
        setHomes(prev => prev.filter(h => h.id !== userToDelete.homeId));
      } else {
        // Remove user from home's users array
        setHomes(prev => prev.map(home => ({
          ...home,
          users: home.users.filter(id => id !== userId)
        })));
      }
    }
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const changePassword = async (newPassword: string) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, password: newPassword };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update password in Firebase user devices structure
      const userRef = ref(database, `users/${currentUser.id}/password`);
      await set(userRef, newPassword);
      
      // Update password in user profile
      const userProfileRef = ref(database, `userProfiles/${currentUser.id}/password`);
      await set(userProfileRef, newPassword);
      
      // Update admin profile if it's an admin
      if (currentUser.role === 'admin') {
        const adminProfileRef = ref(database, `adminProfiles/${currentUser.id}/password`);
        await set(adminProfileRef, newPassword);
      }
    }
  };

  const createHome = (homeData: Omit<Home, 'id' | 'adminId' | 'users' | 'createdAt'>) => {
    const newHome: Home = {
      ...homeData,
      id: `home_${Date.now()}`,
      adminId: currentUser?.id || '1',
      users: [],
      createdAt: new Date().toISOString()
    };
    setHomes(prev => [...prev, newHome]);
  };

  const deleteHome = (homeId: string) => {
    // Remove all users from Firebase for this home
    const homeUsers = users.filter(u => u.homeId === homeId);
    homeUsers.forEach(user => {
      const userRef = ref(database, `users/${user.id}`);
      const userProfileRef = ref(database, `userProfiles/${user.id}`);
      set(userRef, null).catch(console.error);
      set(userProfileRef, null).catch(console.error);
    });

    setHomes(prev => prev.filter(h => h.id !== homeId));
    setUsers(prev => prev.map(user => 
      user.homeId === homeId ? { ...user, homeId: undefined } : user
    ));
  };

  const assignUserToHome = async (userId: string, homeId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, homeId } : user
    ));
    
    setHomes(prev => prev.map(home => {
      if (home.id === homeId) {
        return { ...home, users: [...home.users.filter(id => id !== userId), userId] };
      }
      return { ...home, users: home.users.filter(id => id !== userId) };
    }));

    // Create Firebase structure for the user
    const home = homes.find(h => h.id === homeId);
    if (home) {
      await createFirebaseUserStructure(userId, homeId, home.componentCount);
    }
  };

  const getCurrentUserHome = (): Home | null => {
    if (!currentUser?.homeId) return null;
    return homes.find(home => home.id === currentUser.homeId) || null;
  };

  // Initialize admin profile in Firebase on component mount
  useEffect(() => {
    const initializeAdminProfile = async () => {
      const adminUser = users.find(u => u.role === 'admin');
      if (adminUser) {
        await storeAdminInFirebase(adminUser);
      }
    };
    
    initializeAdminProfile().catch(console.error);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const existingUser = users.find(u => u.id === user.id);
      if (existingUser) {
        setCurrentUser(existingUser);
      }
    }
  }, [users]);

  const value = {
    currentUser,
    users,
    homes,
    login,
    logout,
    isAdmin: currentUser?.role === 'admin',
    addUser,
    removeUser,
    updateUser,
    changePassword,
    createHome,
    deleteHome,
    assignUserToHome,
    getCurrentUserHome
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
