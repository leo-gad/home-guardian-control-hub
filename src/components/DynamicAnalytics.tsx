
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Activity, Zap, Clock } from 'lucide-react';

interface DynamicAnalyticsProps {
  temperature: number;
  humidity: number;
  deviceStates: {
    lamp: boolean;
    door: boolean;
    window: boolean;
    motion: boolean;
  };
}

const DynamicAnalytics: React.FC<DynamicAnalyticsProps> = ({ temperature, humidity, deviceStates }) => {
  // Generate dynamic data for the last 24 hours
  const environmentalData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        temperature: temperature + (Math.random() - 0.5) * 4,
        humidity: humidity + (Math.random() - 0.5) * 10,
      });
    }
    
    return data;
  }, [temperature, humidity]);

  const deviceActivity = useMemo(() => {
    const activeDevices = Object.values(deviceStates).filter(Boolean).length;
    const totalDevices = Object.keys(deviceStates).length;
    const activityScore = (activeDevices / totalDevices) * 100;
    
    return {
      activeDevices,
      totalDevices,
      activityScore: Math.round(activityScore)
    };
  }, [deviceStates]);

  const energyUsage = useMemo(() => {
    // Simulate energy usage based on active devices
    const baseUsage = 12; // Base usage in kWh
    const deviceUsage = deviceStates.lamp ? 0.06 : 0; // Lamp usage
    const totalUsage = baseUsage + deviceUsage;
    
    return {
      current: totalUsage.toFixed(2),
      daily: (totalUsage * 24).toFixed(1),
      weekly: (totalUsage * 24 * 7).toFixed(0)
    };
  }, [deviceStates]);

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Device Activity</p>
                <p className="text-2xl font-bold text-white">{deviceActivity.activityScore}%</p>
                <p className="text-blue-300 text-xs">{deviceActivity.activeDevices}/{deviceActivity.totalDevices} devices active</p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Energy Usage</p>
                <p className="text-2xl font-bold text-white">{energyUsage.current} kWh</p>
                <p className="text-green-300 text-xs">Current hourly rate</p>
              </div>
              <Zap className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">System Uptime</p>
                <p className="text-2xl font-bold text-white">99.8%</p>
                <p className="text-purple-300 text-xs">Last 30 days</p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Trends Chart */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5" />
            Environmental Trends (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={environmentalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickMargin={10}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stackId="1"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.3}
                  name="Temperature (°C)"
                />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stackId="2"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  name="Humidity (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicAnalytics;
