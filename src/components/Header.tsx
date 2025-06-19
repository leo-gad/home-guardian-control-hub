
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Shield, User } from 'lucide-react';

const Header: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuth();

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Home Guardian</h1>
          <p className="text-gray-400">Smart Home Security Control Hub</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white font-medium">{currentUser?.name}</p>
            <div className="flex items-center gap-2">
              <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-xs">
                {isAdmin ? (
                  <>
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 mr-1" />
                    User
                  </>
                )}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" onClick={logout} className="text-gray-400 hover:text-white">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
