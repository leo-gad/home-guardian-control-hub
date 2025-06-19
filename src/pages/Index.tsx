
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/pages/Dashboard';

const Index = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <LoginForm />;
  }

  return <Dashboard />;
};

export default Index;
