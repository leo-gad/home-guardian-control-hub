
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Home, Plus, Trash2, Users, Settings } from 'lucide-react';

const HomeManagement: React.FC = () => {
  const { homes, users, createHome, deleteHome, assignUserToHome } = useAuth();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newHome, setNewHome] = useState({
    name: '',
    componentCount: {
      lamps: 1,
      doors: 1,
      windows: 1,
      motionSensors: 1
    }
  });

  const handleCreateHome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHome.name) {
      toast({
        title: "Error",
        description: "Please enter a home name",
        variant: "destructive",
      });
      return;
    }

    createHome(newHome);
    setNewHome({
      name: '',
      componentCount: {
        lamps: 1,
        doors: 1,
        windows: 1,
        motionSensors: 1
      }
    });
    setShowCreateForm(false);
    toast({
      title: "Success",
      description: "Home created successfully",
    });
  };

  const handleDeleteHome = (homeId: string) => {
    deleteHome(homeId);
    toast({
      title: "Success",
      description: "Home deleted successfully",
    });
  };

  const handleAssignUser = (userId: string, homeId: string) => {
    assignUserToHome(userId, homeId);
    toast({
      title: "Success",
      description: "User assigned to home successfully",
    });
  };

  const getHomeUsers = (homeId: string) => {
    return users.filter(user => user.homeId === homeId);
  };

  const getUnassignedUsers = () => {
    return users.filter(user => user.role === 'user' && !user.homeId);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Home className="h-5 w-5" />
            Home Management ({homes.length})
          </CardTitle>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Home
          </Button>
        </CardHeader>
        
        {showCreateForm && (
          <CardContent className="border-t border-gray-700 pt-6">
            <form onSubmit={handleCreateHome} className="space-y-4">
              <div>
                <Label htmlFor="homeName" className="text-gray-200">Home Name</Label>
                <Input
                  id="homeName"
                  value={newHome.name}
                  onChange={(e) => setNewHome({ ...newHome, name: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter home name"
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-gray-200">Lamps</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={newHome.componentCount.lamps}
                    onChange={(e) => setNewHome({
                      ...newHome,
                      componentCount: { ...newHome.componentCount, lamps: parseInt(e.target.value) || 1 }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-200">Doors</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={newHome.componentCount.doors}
                    onChange={(e) => setNewHome({
                      ...newHome,
                      componentCount: { ...newHome.componentCount, doors: parseInt(e.target.value) || 1 }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-200">Windows</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={newHome.componentCount.windows}
                    onChange={(e) => setNewHome({
                      ...newHome,
                      componentCount: { ...newHome.componentCount, windows: parseInt(e.target.value) || 1 }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-200">Motion Sensors</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={newHome.componentCount.motionSensors}
                    onChange={(e) => setNewHome({
                      ...newHome,
                      componentCount: { ...newHome.componentCount, motionSensors: parseInt(e.target.value) || 1 }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Create Home
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-6">
        {homes.map((home) => (
          <Card key={home.id} className="bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{home.name}</CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteHome(home.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Components</h4>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    {home.componentCount.lamps} Lamps
                  </Badge>
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    {home.componentCount.doors} Doors
                  </Badge>
                  <Badge variant="outline" className="border-purple-500 text-purple-400">
                    {home.componentCount.windows} Windows
                  </Badge>
                  <Badge variant="outline" className="border-red-500 text-red-400">
                    {home.componentCount.motionSensors} Motion Sensors
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Assigned Users ({getHomeUsers(home.id).length})
                </h4>
                <div className="space-y-2">
                  {getHomeUsers(home.id).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <span className="text-white">{user.name}</span>
                      <span className="text-gray-400 text-sm">{user.email}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {getUnassignedUsers().length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Assign New User</h4>
                  <Select onValueChange={(userId) => handleAssignUser(userId, home.id)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select a user to assign" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {getUnassignedUsers().map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {homes.length === 0 && (
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Home className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No homes created yet</h3>
              <p className="text-gray-400 text-center mb-4">
                Create your first home to start managing IoT devices for your users.
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Home
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HomeManagement;
