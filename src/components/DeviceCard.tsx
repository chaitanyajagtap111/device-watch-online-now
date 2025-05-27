
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Activity, Trash2, WifiHigh, WifiOff } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'checking';
  lastChecked: Date;
}

interface DeviceCardProps {
  device: Device;
  onPing: () => void;
  onRemove: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onPing, onRemove }) => {
  const getStatusColor = () => {
    switch (device.status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-red-600';
      case 'checking': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = () => {
    switch (device.status) {
      case 'online': return 'bg-green-100 border-green-200';
      case 'offline': return 'bg-red-100 border-red-200';
      case 'checking': return 'bg-yellow-100 border-yellow-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (device.status) {
      case 'online': return <WifiHigh className="h-5 w-5 text-green-600" />;
      case 'offline': return <WifiOff className="h-5 w-5 text-red-600" />;
      case 'checking': return <Activity className="h-5 w-5 text-yellow-600 animate-pulse" />;
      default: return <Monitor className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatLastChecked = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <Card className="bg-white/90 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Monitor className="h-5 w-5 mr-2 text-blue-600" />
            {device.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Indicator */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusBg()}`}>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`font-semibold capitalize ${getStatusColor()}`}>
              {device.status}
            </span>
          </div>
          {device.status === 'checking' && (
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>

        {/* Device Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">IP Address:</span>
            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {device.ipAddress}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Last Checked:</span>
            <span className="text-sm text-gray-800">
              {formatLastChecked(device.lastChecked)}
            </span>
          </div>
        </div>

        {/* Ping Button */}
        <Button
          onClick={onPing}
          disabled={device.status === 'checking'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 disabled:opacity-50"
        >
          <Activity className="h-4 w-4 mr-2" />
          {device.status === 'checking' ? 'Pinging...' : 'Ping Device'}
        </Button>
      </CardContent>
    </Card>
  );
};
