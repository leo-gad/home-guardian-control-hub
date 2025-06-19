
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Clock } from 'lucide-react';

interface Alert {
  id: string;
  type: 'security' | 'system' | 'info';
  message: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
}

interface AlertPanelProps {
  motionDetected: boolean;
  doorOpen: boolean;
  windowOpen: boolean;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ motionDetected, doorOpen, windowOpen }) => {
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];

    if (motionDetected) {
      alerts.push({
        id: '1',
        type: 'security',
        message: 'Motion detected at main entrance',
        timestamp: new Date().toLocaleTimeString(),
        severity: 'high'
      });
    }

    if (doorOpen) {
      alerts.push({
        id: '2',
        type: 'security',
        message: 'Door is currently open',
        timestamp: new Date().toLocaleTimeString(),
        severity: 'medium'
      });
    }

    if (windowOpen) {
      alerts.push({
        id: '3',
        type: 'system',
        message: 'Window is open',
        timestamp: new Date().toLocaleTimeString(),
        severity: 'low'
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        id: '4',
        type: 'info',
        message: 'All systems normal',
        timestamp: new Date().toLocaleTimeString(),
        severity: 'low'
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'system':
        return <Shield className="h-4 w-4 text-blue-400" />;
      default:
        return <Shield className="h-4 w-4 text-green-400" />;
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <AlertTriangle className="h-5 w-5" />
          Security Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start justify-between p-3 bg-gray-800 rounded-lg">
            <div className="flex items-start gap-3">
              {getTypeIcon(alert.type)}
              <div>
                <p className="text-sm text-gray-200">{alert.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-400">{alert.timestamp}</span>
                </div>
              </div>
            </div>
            <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
              {alert.severity.toUpperCase()}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AlertPanel;
