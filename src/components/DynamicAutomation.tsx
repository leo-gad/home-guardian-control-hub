
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Shield, Thermometer, Clock, Zap } from 'lucide-react';

interface AutomationSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'energy' | 'security' | 'comfort' | 'schedule';
  priority: 'low' | 'medium' | 'high';
  icon: React.ReactNode;
  estimated_savings?: string;
}

interface DynamicAutomationProps {
  temperature: number;
  humidity: number;
  deviceStates: {
    lamp: boolean;
    door: boolean;
    window: boolean;
    motion: boolean;
  };
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

const DynamicAutomation: React.FC<DynamicAutomationProps> = ({
  temperature,
  humidity,
  deviceStates,
  timeOfDay
}) => {
  const suggestions = useMemo(() => {
    const suggestions: AutomationSuggestion[] = [];

    // Temperature-based suggestions
    if (temperature > 26) {
      suggestions.push({
        id: 'temp-high',
        title: 'Cool Down Automation',
        description: 'Automatically open windows when temperature exceeds 26°C',
        type: 'comfort',
        priority: 'medium',
        icon: <Thermometer className="h-4 w-4" />,
        estimated_savings: '15% energy'
      });
    }

    // Security suggestions
    if (deviceStates.door && timeOfDay === 'night') {
      suggestions.push({
        id: 'night-security',
        title: 'Night Security Alert',
        description: 'Send notifications when doors are opened after 10 PM',
        type: 'security',
        priority: 'high',
        icon: <Shield className="h-4 w-4" />
      });
    }

    // Energy savings
    if (deviceStates.lamp && timeOfDay === 'morning') {
      suggestions.push({
        id: 'morning-lights',
        title: 'Morning Light Schedule',
        description: 'Automatically turn off lights at sunrise',
        type: 'energy',
        priority: 'medium',
        icon: <Zap className="h-4 w-4" />,
        estimated_savings: '20% lighting cost'
      });
    }

    // Motion-based automation
    if (!deviceStates.motion && deviceStates.lamp) {
      suggestions.push({
        id: 'motion-lights',
        title: 'Motion-Based Lighting',
        description: 'Turn off lights when no motion detected for 10 minutes',
        type: 'energy',
        priority: 'low',
        icon: <Lightbulb className="h-4 w-4" />,
        estimated_savings: '25% lighting cost'
      });
    }

    // Schedule-based suggestions
    if (timeOfDay === 'evening') {
      suggestions.push({
        id: 'evening-routine',
        title: 'Evening Routine',
        description: 'Automatically dim lights and secure doors at 9 PM',
        type: 'schedule',
        priority: 'low',
        icon: <Clock className="h-4 w-4" />
      });
    }

    return suggestions;
  }, [temperature, deviceStates, timeOfDay]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'energy': return 'bg-green-900 text-green-200';
      case 'security': return 'bg-red-900 text-red-200';
      case 'comfort': return 'bg-blue-900 text-blue-200';
      case 'schedule': return 'bg-purple-900 text-purple-200';
      default: return 'bg-gray-900 text-gray-200';
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          Smart Automation Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No automation suggestions at the moment.</p>
            <p className="text-sm">Your system is running optimally!</p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(suggestion.type)}`}>
                    {suggestion.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{suggestion.title}</h3>
                    <p className="text-gray-400 text-sm">{suggestion.description}</p>
                  </div>
                </div>
                <Badge variant={getPriorityColor(suggestion.priority) as any}>
                  {suggestion.priority}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                {suggestion.estimated_savings && (
                  <div className="text-green-400 text-sm font-medium">
                    💰 Save {suggestion.estimated_savings}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-gray-300">
                    Learn More
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Enable
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default DynamicAutomation;
