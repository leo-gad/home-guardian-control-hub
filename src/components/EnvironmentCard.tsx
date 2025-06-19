
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Droplets } from 'lucide-react';

interface EnvironmentCardProps {
  temperature: number;
  humidity: number;
}

const EnvironmentCard: React.FC<EnvironmentCardProps> = ({ temperature, humidity }) => {
  return (
    <Card className="bg-gradient-to-br from-blue-900 to-purple-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Environment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-5 w-5 text-red-400" />
            <span className="text-gray-200">Temperature</span>
          </div>
          <span className="text-xl font-bold text-white">{temperature}°C</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Droplets className="h-5 w-5 text-blue-400" />
            <span className="text-gray-200">Humidity</span>
          </div>
          <span className="text-xl font-bold text-white">{humidity}%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvironmentCard;
