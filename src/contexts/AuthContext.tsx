
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  homeId?: string;
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
  addUser: (user: Omit<User, 'id'>) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  createHome: (homeData: Omit<Home, 'id' | 'adminId' | 'users' | 'createdAt'>) => void;
  deleteHome: (homeId: string) => void;
  assignUserToHome: (userId: string, homeId: string) => void;
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
      role: 'admin'
    },
    {
      id: '2', 
      name: 'John Doe',
      email: 'user@home.com',
      role: 'user',
      homeId: 'home1'
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

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.email === email);
    if (user && password === 'password123') {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser = { ...userData, id: Date.now().toString() };
    setUsers(prev => [...prev, newUser]);
  };

  const removeUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    // Remove user from homes
    setHomes(prev => prev.map(home => ({
      ...home,
      users: home.users.filter(id => id !== userId)
    })));
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
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
    setHomes(prev => prev.filter(h => h.id !== homeId));
    // Remove homeId from users
    setUsers(prev => prev.map(user => 
      user.homeId === homeId ? { ...user, homeId: undefined } : user
    ));
  };

  const assignUserToHome = (userId: string, homeId: string) => {
    // Update user's homeId
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, homeId } : user
    ));
    
    // Add user to home's users array
    setHomes(prev => prev.map(home => {
      if (home.id === homeId) {
        return { ...home, users: [...home.users.filter(id => id !== userId), userId] };
      }
      return { ...home, users: home.users.filter(id => id !== userId) };
    }));
  };

  const getCurrentUserHome = (): Home | null => {
    if (!currentUser?.homeId) return null;
    return homes.find(home => home.id === currentUser.homeId) || null;
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Make sure the user still exists in our users array
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
