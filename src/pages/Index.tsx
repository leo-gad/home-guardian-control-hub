
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/pages/Dashboard';

const Index = () => {
  const { currentUser } = useAuth();

  // Always show login form first if no user is logged in
  if (!currentUser) {
    return <LoginForm />;
  }

  return <Dashboard />;
};

export default Index;
