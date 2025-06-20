
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lamp, DoorClosed, DoorOpen, RectangleHorizontal, Bell, Power } from 'lucide-react';

interface DeviceCardProps {
  title: string;
  type: 'lamp' | 'door' | 'window' | 'motion';
  status: boolean;
  onToggle?: (value: boolean) => void;
  canControl?: boolean;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ 
  title, 
  type, 
  status, 
  onToggle, 
  canControl = true 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'lamp':
        return <Lamp className={`h-6 w-6 transition-colors duration-300 ${status ? 'text-yellow-400' : 'text-gray-400'}`} />;
      case 'door':
        return status ? 
          <DoorOpen className="h-6 w-6 text-red-400 transition-colors duration-300" /> : 
          <DoorClosed className="h-6 w-6 text-green-400 transition-colors duration-300" />;
      case 'window':
        return <RectangleHorizontal className={`h-6 w-6 transition-colors duration-300 ${status ? 'text-blue-400' : 'text-gray-400'}`} />;
      case 'motion':
        return <Bell className={`h-6 w-6 ${status ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (type) {
      case 'lamp':
        return status ? 'ON' : 'OFF';
      case 'door':
        return status ? 'OPEN' : 'CLOSED';
      case 'window':
        return status ? 'OPEN' : 'CLOSED';
      case 'motion':
        return status ? 'DETECTED' : 'CLEAR';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    if (type === 'motion') {
      return status ? 'destructive' : 'secondary';
    }
    if (type === 'door') {
      return status ? 'destructive' : 'secondary';
    }
    return status ? 'default' : 'secondary';
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle(!status);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700 hover:border-blue-500 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-200">{title}</CardTitle>
        {getIcon()}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant={getStatusColor()} className="mb-2 transition-colors duration-300">
            {getStatusText()}
          </Badge>
          {canControl && type !== 'motion' && onToggle && (
            <Button
              size="sm"
              variant={status ? "default" : "outline"}
              onClick={handleToggle}
              className={`
                transition-all duration-300 
                ${status 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
                }
              `}
            >
              <Power className="h-3 w-3 mr-1" />
              {status ? 'Turn Off' : 'Turn On'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceCard;
