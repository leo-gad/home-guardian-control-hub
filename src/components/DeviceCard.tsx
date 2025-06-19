import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Lamp, DoorClosed, DoorOpen, RectangleHorizontal, Bell } from 'lucide-react';

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
        return <Lamp className={`h-6 w-6 ${status ? 'text-yellow-400' : 'text-gray-400'}`} />;
      case 'door':
        return status ? 
          <DoorOpen className="h-6 w-6 text-red-400" /> : 
          <DoorClosed className="h-6 w-6 text-green-400" />;
      case 'window':
        return <RectangleHorizontal className={`h-6 w-6 ${status ? 'text-blue-400' : 'text-gray-400'}`} />;
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

  return (
    <Card className="bg-gray-900 border-gray-700 hover:border-blue-500 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-200">{title}</CardTitle>
        {getIcon()}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant={getStatusColor()} className="mb-2">
            {getStatusText()}
          </Badge>
          {canControl && type !== 'motion' && onToggle && (
            <Switch
              checked={status}
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-blue-500"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceCard;
