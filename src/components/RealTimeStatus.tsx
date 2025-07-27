import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Wifi, WifiOff } from 'lucide-react';

interface RealTimeStatusProps {
  isConnected?: boolean;
  lastUpdate?: Date;
}

const RealTimeStatus: React.FC<RealTimeStatusProps> = ({ 
  isConnected = true, 
  lastUpdate 
}) => {
  return (
    <Card className="w-full">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium">Real-Time Status</span>
          </div>
          <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        {lastUpdate && (
          <div className="flex items-center space-x-1 mt-2">
            <Activity className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeStatus;