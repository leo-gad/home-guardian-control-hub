import React, { useMemo, lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useFirestoreData } from '@/hooks/useFirestoreData';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import DeviceCard from '@/components/DeviceCard';
import EnvironmentCard from '@/components/EnvironmentCard';
import AlertPanel from '@/components/AlertPanel';
import DynamicAnalytics from '@/components/DynamicAnalytics';
import DynamicStatusIndicator from '@/components/DynamicStatusIndicator';
import DynamicAutomation from '@/components/DynamicAutomation';
import { Home, Users, Settings, Building, User, BarChart3, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
const UserManagement = lazy(() => import('@/components/UserManagement'));
const HomeManagement = lazy(() => import('@/components/HomeManagement'));
const AdminSettings = lazy(() => import('@/components/AdminSettings'));
const UserSettings = lazy(() => import('@/components/UserSettings'));
const UserProfile = lazy(() => import('@/components/UserProfile'));

const Dashboard: React.FC = () => {
  const { isAdmin, getCurrentUserHome, currentUser } = useAuth();
  const { getThemeClasses } = useTheme();
  const { data, loading, error, updateDevice } = useFirestoreData();
  const { toast } = useToast();
  const userHome = getCurrentUserHome();

  // Get current time of day for dynamic suggestions
  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }, []);

  const handleDeviceToggle = useMemo(() => 
    async (device: string, value: boolean) => {
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
    }, [updateDevice, toast]
  );

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
          onToggle={(value) => handleDeviceToggle('lamp', value)}
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
          onToggle={(value) => handleDeviceToggle('door', value)}
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
          onToggle={(value) => handleDeviceToggle('window', value)}
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

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${getThemeClasses()}`}>
        <Header />
        <main className="p-6">
          <LoadingSkeleton />
        </main>
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
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="automation" className="data-[state=active]:bg-blue-600">
              <Zap className="h-4 w-4 mr-2" />
              Automation
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
            {/* Dynamic Status Indicator */}
            <DynamicStatusIndicator 
              isConnected={!error}
              lastUpdated={data.lastUpdated}
            />

            {userHome && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-white">{userHome.name}</h2>
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

          <TabsContent value="analytics">
            <DynamicAnalytics
              temperature={data.temperature}
              humidity={data.humidity}
              deviceStates={{
                lamp: data.lamp,
                door: data.door,
                window: data.window,
                motion: data.motion
              }}
            />
          </TabsContent>

          <TabsContent value="automation">
            <DynamicAutomation
              temperature={data.temperature}
              humidity={data.humidity}
              deviceStates={{
                lamp: data.lamp,
                door: data.door,
                window: data.window,
                motion: data.motion
              }}
              timeOfDay={timeOfDay}
            />
          </TabsContent>

          {isAdmin && (
            <>
              <TabsContent value="homes">
                <Suspense fallback={<LoadingSkeleton />}>
                  <HomeManagement />
                </Suspense>
              </TabsContent>
              <TabsContent value="users">
                <Suspense fallback={<LoadingSkeleton />}>
                  <UserManagement />
                </Suspense>
              </TabsContent>
            </>
          )}

          <TabsContent value="profile">
            <Suspense fallback={<LoadingSkeleton />}>
              <UserProfile />
            </Suspense>
          </TabsContent>

          <TabsContent value="settings">
            <Suspense fallback={<LoadingSkeleton />}>
              {isAdmin ? (
                <AdminSettings />
              ) : (
                <UserSettings />
              )}
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
