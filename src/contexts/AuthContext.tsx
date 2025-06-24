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

// Storage keys for persistence
const STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  USERS: 'users',
  HOMES: 'homes',
  LAST_SYNC: 'lastSync'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [homes, setHomes] = useState<Home[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage
  const loadFromStorage = () => {
    try {
      const savedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const savedHomes = localStorage.getItem(STORAGE_KEYS.HOMES);

      if (savedCurrentUser) {
        const parsedUser = JSON.parse(savedCurrentUser);
        setCurrentUser(parsedUser);
        console.log('Restored current user from localStorage:', parsedUser.email);
      }

      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        setUsers(parsedUsers);
        console.log('Restored users from localStorage:', parsedUsers.length);
      } else {
        // Initialize with default data if no saved data exists
        const defaultUsers = [
          {
            id: '1',
            name: 'Admin User',
            email: 'admin@home.com',
            role: 'admin' as const,
            password: 'password123'
          },
          {
            id: '2', 
            name: 'John Doe',
            email: 'user@home.com',
            role: 'user' as const,
            homeId: 'home1',
            password: 'password123'
          }
        ];
        setUsers(defaultUsers);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
      }

      if (savedHomes) {
        const parsedHomes = JSON.parse(savedHomes);
        setHomes(parsedHomes);
        console.log('Restored homes from localStorage:', parsedHomes.length);
      } else {
        // Initialize with default data if no saved data exists
        const defaultHomes = [
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
        ];
        setHomes(defaultHomes);
        localStorage.setItem(STORAGE_KEYS.HOMES, JSON.stringify(defaultHomes));
      }

    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      // Initialize with default data on error
      initializeDefaultData();
    }
  };

  // Save data to localStorage
  const saveToStorage = () => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      }
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.HOMES, JSON.stringify(homes));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      console.log('Data saved to localStorage');
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  };

  // Initialize with default data
  const initializeDefaultData = () => {
    const defaultUsers = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@home.com',
        role: 'admin' as const,
        password: 'password123'
      },
      {
        id: '2', 
        name: 'John Doe',
        email: 'user@home.com',
        role: 'user' as const,
        homeId: 'home1',
        password: 'password123'
      }
    ];

    const defaultHomes = [
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
    ];

    setUsers(defaultUsers);
    setHomes(defaultHomes);
  };

  // Initialize data on component mount
  useEffect(() => {
    loadFromStorage();
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isInitialized) {
      saveToStorage();
    }
  }, [currentUser, users, homes, isInitialized]);

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

      const userData = {
        name: user.name,
        email: user.email,
        password: user.password,
        homeId: homeId,
        devices: {}
      };

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

      userData.devices['temperature'] = 25;
      userData.devices['humidity'] = 60;
      userData.devices['lastUpdated'] = new Date().toISOString();

      await set(userRef, userData);
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
      
      if (user.role === 'admin') {
        await storeAdminInFirebase(user);
      }
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    const newUser = { ...userData, id: Date.now().toString() };
    setUsers(prev => [...prev, newUser]);
    
    await storeUserInFirebase(newUser);
    
    if (newUser.homeId) {
      const home = homes.find(h => h.id === newUser.homeId);
      if (home) {
        await createFirebaseUserStructure(newUser.id, newUser.homeId, home.componentCount);
      }
    }
  };

  const removeUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    
    setUsers(prev => prev.filter(u => u.id !== userId));
    
    if (userToDelete) {
      const userRef = ref(database, `users/${userId}`);
      const userProfileRef = ref(database, `userProfiles/${userId}`);
      set(userRef, null).catch(console.error);
      set(userProfileRef, null).catch(console.error);
    }
    
    if (userToDelete?.homeId) {
      const userHome = homes.find(h => h.id === userToDelete.homeId);
      if (userHome && userHome.users.length === 1 && userHome.users[0] === userId) {
        setHomes(prev => prev.filter(h => h.id !== userToDelete.homeId));
      } else {
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
      
      const userRef = ref(database, `users/${currentUser.id}/password`);
      await set(userRef, newPassword);
      
      const userProfileRef = ref(database, `userProfiles/${currentUser.id}/password`);
      await set(userProfileRef, newPassword);
      
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

    const home = homes.find(h => h.id === homeId);
    if (home) {
      await createFirebaseUserStructure(userId, homeId, home.componentCount);
    }
  };

  const getCurrentUserHome = (): Home | null => {
    if (!currentUser?.homeId) return null;
    return homes.find(home => home.id === currentUser.homeId) || null;
  };

  useEffect(() => {
    const initializeAdminProfile = async () => {
      const adminUser = users.find(u => u.role === 'admin');
      if (adminUser) {
        await storeAdminInFirebase(adminUser);
      }
    };
    
    if (isInitialized) {
      initializeAdminProfile().catch(console.error);
    }
  }, [users, isInitialized]);

  // Validate current user exists in users array after loading
  useEffect(() => {
    if (isInitialized && currentUser) {
      const existingUser = users.find(u => u.id === currentUser.id);
      if (!existingUser) {
        console.log('Current user not found in users array, logging out');
        logout();
      } else if (existingUser.email !== currentUser.email || existingUser.name !== currentUser.name) {
        // Update current user if user data has changed
        setCurrentUser(existingUser);
      }
    }
  }, [users, currentUser, isInitialized]);

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
