
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { Settings, Palette, Lock, Trash2, User } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { currentUser, changePassword, users, removeUser, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    changePassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    toast({
      title: "Success",
      description: "Password changed successfully",
    });
  };

  const handleEmailChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // Check if email already exists
    const emailExists = users.some(u => u.email === newEmail && u.id !== currentUser?.id);
    if (emailExists) {
      toast({
        title: "Error",
        description: "This email is already in use",
        variant: "destructive",
      });
      return;
    }

    if (currentUser) {
      updateUser(currentUser.id, { email: newEmail });
      setNewEmail('');
      toast({
        title: "Success",
        description: "Email changed successfully",
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Error",
        description: "Cannot delete your own account",
        variant: "destructive",
      });
      return;
    }
    removeUser(userId);
    toast({
      title: "Success",
      description: "User deleted successfully",
    });
  };

  const regularUsers = users.filter(u => u.role === 'user');

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Palette className="h-5 w-5" />
            Dashboard Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label className="text-gray-200">Select Theme</Label>
            <Select value={theme} onValueChange={(value: 'dark' | 'light' | 'blue' | 'green') => setTheme(value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="dark">Dark Theme</SelectItem>
                <SelectItem value="light">Light Theme</SelectItem>
                <SelectItem value="blue">Blue Theme</SelectItem>
                <SelectItem value="green">Green Theme</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="h-5 w-5" />
            Change Admin Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <Label htmlFor="currentEmail" className="text-gray-200">Current Email</Label>
              <Input
                id="currentEmail"
                type="email"
                value={currentUser?.email || ''}
                disabled
                className="bg-gray-600 border-gray-500 text-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="newEmail" className="text-gray-200">New Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter new email address"
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Change Email
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Lock className="h-5 w-5" />
            Change Admin Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="text-gray-200">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-200">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Confirm new password"
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trash2 className="h-5 w-5" />
            Delete Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {regularUsers.length === 0 ? (
              <p className="text-gray-400">No users to delete</p>
            ) : (
              regularUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">{user.name}</h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
