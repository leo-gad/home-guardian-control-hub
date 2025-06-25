
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Signal, SignalLow, SignalMedium, SignalHigh } from 'lucide-react';

interface DynamicStatusIndicatorProps {
  isConnected: boolean;
  lastUpdated: string;
}

const DynamicStatusIndicator: React.FC<DynamicStatusIndicatorProps> = ({ 
  isConnected, 
  lastUpdated 
}) => {
  const [signalStrength, setSignalStrength] = useState<'low' | 'medium' | 'high'>('high');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Simulate dynamic signal strength based on connection quality
    const interval = setInterval(() => {
      const strengths: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
      const weights = isConnected && isOnline ? [0.1, 0.2, 0.7] : [0.7, 0.2, 0.1];
      
      const random = Math.random();
      let cumulative = 0;
      
      for (let i = 0; i < strengths.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) {
          setSignalStrength(strengths[i]);
          break;
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isConnected, isOnline]);

  const getSignalIcon = () => {
    if (!isOnline || !isConnected) {
      return <WifiOff className="h-4 w-4" />;
    }

    switch (signalStrength) {
      case 'low':
        return <SignalLow className="h-4 w-4 text-red-400" />;
      case 'medium':
        return <SignalMedium className="h-4 w-4 text-yellow-400" />;
      case 'high':
        return <SignalHigh className="h-4 w-4 text-green-400" />;
      default:
        return <Signal className="h-4 w-4" />;
    }
  };

  const getStatusBadge = () => {
    if (!isOnline) {
      return <Badge variant="destructive" className="animate-pulse">Offline</Badge>;
    }
    
    if (!isConnected) {
      return <Badge variant="destructive" className="animate-pulse">Disconnected</Badge>;
    }

    return <Badge variant="default" className="bg-green-600">Online</Badge>;
  };

  const getLastUpdatedText = () => {
    if (!lastUpdated) return 'Never';
    
    const date = new Date(lastUpdated);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 30) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2">
        {getSignalIcon()}
        {getStatusBadge()}
      </div>
      <div className="text-sm text-gray-400">
        Last updated: {getLastUpdatedText()}
      </div>
    </div>
  );
};

export default DynamicStatusIndicator;
