
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Trash2, Users, Building } from 'lucide-react';

const UserManagement: React.FC = () => {
  const { users, addUser, removeUser, currentUser, homes, assignUserToHome } = useAuth();
  const { toast } = useToast();
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newUser.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      await addUser(newUser);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      toast({
        title: "Success",
        description: "User added successfully with Firebase structure created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleRemoveUser = (userId: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Error",
        description: "Cannot remove your own account",
        variant: "destructive",
      });
      return;
    }
    removeUser(userId);
    toast({
      title: "Success",
      description: "User and Firebase data removed successfully",
    });
  };

  const handleAssignToHome = async (userId: string, homeId: string) => {
    try {
      await assignUserToHome(userId, homeId);
      toast({
        title: "Success",
        description: "User assigned to home and Firebase structure created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign user to home",
        variant: "destructive",
      });
    }
  };

  const getUserHome = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user?.homeId) return null;
    return homes.find(h => h.id === user.homeId);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <UserPlus className="h-5 w-5" />
            Add New User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-gray-200">Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-200">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter password (min 6 characters)"
              />
            </div>
            <div>
              <Label className="text-gray-200">Role</Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value: 'admin' | 'user') => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Add user
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            User List ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => {
              const userHome = getUserHome(user.id);
              return (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{user.name}</h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      {user.id === currentUser?.id && (
                        <Badge variant="outline" className="border-green-500 text-green-400">
                          Current User
                        </Badge>
                      )}
                      {userHome && (
                        <Badge variant="outline" className="border-blue-500 text-blue-400">
                          <Building className="h-3 w-3 mr-1" />
                          {userHome.name}
                        </Badge>
                      )}
                    </div>
                    
                    {user.role === 'user' && !user.homeId && homes.length > 0 && (
                      <div className="mt-2">
                        <Select onValueChange={(homeId) => handleAssignToHome(user.id, homeId)}>
                          <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white text-xs">
                            <SelectValue placeholder="Assign to home" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            {homes.map((home) => (
                              <SelectItem key={home.id} value={home.id}>
                                {home.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  {user.id !== currentUser?.id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
