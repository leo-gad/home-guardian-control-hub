
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import DeviceCard from '@/components/DeviceCard';
import EnvironmentCard from '@/components/EnvironmentCard';
import AlertPanel from '@/components/AlertPanel';
import UserManagement from '@/components/UserManagement';
import { Home, Users, Settings } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const { data, loading, error, updateDevice } = useFirebaseData();
  const { toast } = useToast();

  const handleDeviceToggle = async (device: string, value: boolean) => {
    try {
      await updateDevice(device, value);
      toast({
        title: "Device Updated",
        description: `${device} has been ${value ? 'turned on' : 'turned off'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update device",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      
      <main className="p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">
                <Users className="h-4 w-4 mr-2" />
                User Management
              </TabsTrigger>
            )}
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <EnvironmentCard 
                  temperature={data.temperature} 
                  humidity={data.humidity} 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DeviceCard
                    title="Living Room Lamp"
                    type="lamp"
                    status={data.lamp}
                    onToggle={(value) => handleDeviceToggle('lamp', value)}
                  />
                  <DeviceCard
                    title="Main Door"
                    type="door"
                    status={data.door}
                    onToggle={(value) => handleDeviceToggle('door', value)}
                  />
                  <DeviceCard
                    title="Window"
                    type="window"
                    status={data.window}
                    onToggle={(value) => handleDeviceToggle('window', value)}
                  />
                </div>

                <DeviceCard
                  title="Motion Sensor"
                  type="motion"
                  status={data.motion}
                  canControl={false}
                />
              </div>

              <div>
                <AlertPanel
                  motionDetected={data.motion}
                  doorOpen={data.door}
                  windowOpen={data.window}
                />
              </div>
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}

          <TabsContent value="settings">
            <div className="text-white">
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <p className="text-gray-400">System settings and configuration options will be available here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
