
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Droplets, Wind, Eye } from 'lucide-react';

interface EnvironmentCardProps {
  temperature: number;
  humidity: number;
}

const EnvironmentCard: React.FC<EnvironmentCardProps> = ({ temperature, humidity }) => {
  const [animatedTemp, setAnimatedTemp] = useState(temperature);
  const [animatedHumidity, setAnimatedHumidity] = useState(humidity);

  // Animate value changes
  useEffect(() => {
    const tempInterval = setInterval(() => {
      setAnimatedTemp(prev => {
        const diff = temperature - prev;
        if (Math.abs(diff) < 0.1) return temperature;
        return prev + diff * 0.1;
      });
    }, 50);

    return () => clearInterval(tempInterval);
  }, [temperature]);

  useEffect(() => {
    const humidityInterval = setInterval(() => {
      setAnimatedHumidity(prev => {
        const diff = humidity - prev;
        if (Math.abs(diff) < 0.1) return humidity;
        return prev + diff * 0.1;
      });
    }, 50);

    return () => clearInterval(humidityInterval);
  }, [humidity]);

  const getTemperatureColor = (temp: number) => {
    if (temp < 18) return 'text-blue-400';
    if (temp < 23) return 'text-green-400';
    if (temp < 28) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHumidityColor = (hum: number) => {
    if (hum < 30) return 'text-orange-400';
    if (hum < 60) return 'text-blue-400';
    return 'text-purple-400';
  };

  const getComfortLevel = () => {
    const tempComfort = temperature >= 20 && temperature <= 26;
    const humidityComfort = humidity >= 40 && humidity <= 60;
    
    if (tempComfort && humidityComfort) return { level: 'Optimal', color: 'text-green-400' };
    if (tempComfort || humidityComfort) return { level: 'Good', color: 'text-yellow-400' };
    return { level: 'Poor', color: 'text-red-400' };
  };

  const comfort = getComfortLevel();

  return (
    <Card className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 border-gray-700 overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <CardHeader className="relative">
        <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
          Environment Monitor
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className={`text-sm ${comfort.color}`}>{comfort.level}</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 relative">
        {/* Temperature */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Thermometer className={`h-6 w-6 ${getTemperatureColor(temperature)}`} />
            </div>
            <div>
              <span className="text-gray-200 text-sm">Temperature</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getTemperatureColor(temperature)} transition-all duration-500`}>
                  {animatedTemp.toFixed(1)}°C
                </span>
                {temperature !== animatedTemp && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
          
          {/* Temperature progress bar */}
          <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getTemperatureColor(temperature).replace('text-', 'bg-')} transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min((temperature / 40) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Humidity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Droplets className={`h-6 w-6 ${getHumidityColor(humidity)}`} />
            </div>
            <div>
              <span className="text-gray-200 text-sm">Humidity</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getHumidityColor(humidity)} transition-all duration-500`}>
                  {animatedHumidity.toFixed(1)}%
                </span>
                {humidity !== animatedHumidity && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
          
          {/* Humidity progress bar */}
          <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getHumidityColor(humidity).replace('text-', 'bg-')} transition-all duration-1000 ease-out`}
              style={{ width: `${humidity}%` }}
            ></div>
          </div>
        </div>

        {/* Air Quality Indicator */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-600">
          <div className="flex items-center space-x-2">
            <Wind className="h-5 w-5 text-gray-400" />
            <span className="text-gray-200 text-sm">Air Quality</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">Good</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvironmentCard;
