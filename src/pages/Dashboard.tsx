import React, { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import DeviceCard from '@/components/DeviceCard';
import EnvironmentCard from '@/components/EnvironmentCard';
import AlertPanel from '@/components/AlertPanel';
import UserManagement from '@/components/UserManagement';
import HomeManagement from '@/components/HomeManagement';
import AdminSettings from '@/components/AdminSettings';
import UserSettings from '@/components/UserSettings';
import UserProfile from '@/components/UserProfile';
import { Home, Users, Settings, Building, User } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { isAdmin, getCurrentUserHome, currentUser } = useAuth();
  const { getThemeClasses } = useTheme();
  const { data, loading, error, updateDevice } = useFirebaseData();
  const { toast } = useToast();
  const userHome = getCurrentUserHome();

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

  const deviceCards = useMemo(() => {
    if (!userHome && currentUser?.role === 'user') {
      return (
        <div className="col-span-full text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Home Assigned</h3>
          <p className="text-gray-400">
            Please contact your administrator to assign you to a home.
          </p>
        </div>
      );
    }

    const componentCount = userHome?.componentCount || {
      lamps: 1,
      doors: 1,
      windows: 1,
      motionSensors: 1
    };

    const devices = [];

    for (let i = 0; i < componentCount.lamps; i++) {
      devices.push(
        <DeviceCard
          key={`lamp-${i}`}
          title={`Lamp ${i + 1}`}
          type="lamp"
          status={data.lamp}
          onToggle={(value) => handleDeviceToggle(`lamp${i + 1}`, value)}
        />
      );
    }

    for (let i = 0; i < componentCount.doors; i++) {
      devices.push(
        <DeviceCard
          key={`door-${i}`}
          title={`Door ${i + 1}`}
          type="door"
          status={data.door}
          onToggle={(value) => handleDeviceToggle(`door${i + 1}`, value)}
        />
      );
    }

    for (let i = 0; i < componentCount.windows; i++) {
      devices.push(
        <DeviceCard
          key={`window-${i}`}
          title={`Window ${i + 1}`}
          type="window"
          status={data.window}
          onToggle={(value) => handleDeviceToggle(`window${i + 1}`, value)}
        />
      );
    }

    for (let i = 0; i < componentCount.motionSensors; i++) {
      devices.push(
        <DeviceCard
          key={`motion-${i}`}
          title={`Motion Sensor ${i + 1}`}
          type="motion"
          status={data.motion}
          canControl={false}
        />
      );
    }

    return devices;
  }, [userHome, currentUser, data, handleDeviceToggle]);

  if (loading) {
    return (
      <div className={`min-h-screen ${getThemeClasses()} flex items-center justify-center`}>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${getThemeClasses()} flex items-center justify-center`}>
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getThemeClasses()}`}>
      <Header />
      
      <main className="p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="homes" className="data-[state=active]:bg-blue-600">
                  <Building className="h-4 w-4 mr-2" />
                  Home Management
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {userHome && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{userHome.name}</h2>
                <p className="text-gray-400">
                  Managing {userHome.componentCount.lamps + userHome.componentCount.doors + userHome.componentCount.windows + userHome.componentCount.motionSensors} devices
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <EnvironmentCard 
                  temperature={data.temperature} 
                  humidity={data.humidity} 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {deviceCards}
                </div>
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
            <>
              <TabsContent value="homes">
                <HomeManagement />
              </TabsContent>
              <TabsContent value="users">
                <UserManagement />
              </TabsContent>
            </>
          )}

          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>

          <TabsContent value="settings">
            {isAdmin ? (
              <AdminSettings />
            ) : (
              <UserSettings />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
