
import React, { useState, useEffect, useRef } from 'react';
import { DeviceCard } from '@/components/DeviceCard';
import { AddDeviceForm } from '@/components/AddDeviceForm';
import { Monitor, Plus, Activity, Settings, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Device {
  id: string;
  name: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'checking';
  lastChecked: Date;
}

const Index = () => {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'Router',
      ipAddress: '192.168.1.1',
      status: 'online',
      lastChecked: new Date(),
    },
    {
      id: '2',
      name: 'Server',
      ipAddress: '192.168.1.100',
      status: 'offline',
      lastChecked: new Date(),
    },
    {
      id: '3',
      name: 'Printer',
      ipAddress: '192.168.1.200',
      status: 'online',
      lastChecked: new Date(),
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoPingEnabled, setAutoPingEnabled] = useState(true); // Changed from false to true
  const [pingInterval, setPingInterval] = useState(30); // seconds
  const [staggerDelay, setStaggerDelay] = useState(2); // seconds between each device ping
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentDeviceIndex = useRef(0);

  // Simulate ping checking
  const checkDeviceStatus = async (device: Device): Promise<'online' | 'offline'> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    // Simulate random connectivity for demo purposes
    return Math.random() > 0.3 ? 'online' : 'offline';
  };

  const pingDevice = async (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, status: 'checking' }
        : device
    ));

    const device = devices.find(d => d.id === deviceId);
    if (device) {
      const status = await checkDeviceStatus(device);
      setDevices(prev => prev.map(d => 
        d.id === deviceId 
          ? { ...d, status, lastChecked: new Date() }
          : d
      ));
    }
  };

  // Staggered ping function to avoid network overload
  const pingDevicesStaggered = async () => {
    if (devices.length === 0) return;
    
    console.log('Starting staggered ping cycle...');
    
    for (let i = 0; i < devices.length; i++) {
      const device = devices[i];
      if (device) {
        console.log(`Pinging device ${i + 1}/${devices.length}: ${device.name}`);
        await pingDevice(device.id);
        
        // Wait between pings to reduce network load (except for the last device)
        if (i < devices.length - 1) {
          await new Promise(resolve => setTimeout(resolve, staggerDelay * 1000));
        }
      }
    }
    
    console.log('Ping cycle completed');
  };

  const pingAllDevices = async () => {
    const promises = devices.map(device => pingDevice(device.id));
    await Promise.all(promises);
  };

  // Auto-ping effect
  useEffect(() => {
    if (autoPingEnabled && devices.length > 0) {
      console.log(`Auto-ping enabled with ${pingInterval}s interval and ${staggerDelay}s stagger delay`);
      
      // Start immediately
      pingDevicesStaggered();
      
      // Set up interval for subsequent pings
      intervalRef.current = setInterval(() => {
        pingDevicesStaggered();
      }, pingInterval * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log('Auto-ping disabled');
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoPingEnabled, pingInterval, staggerDelay, devices.length]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const addDevice = (name: string, ipAddress: string) => {
    const newDevice: Device = {
      id: Date.now().toString(),
      name,
      ipAddress,
      status: 'checking',
      lastChecked: new Date(),
    };
    setDevices(prev => [...prev, newDevice]);
    setShowAddForm(false);
    
    // Immediately check the new device
    setTimeout(() => pingDevice(newDevice.id), 100);
  };

  const removeDevice = (deviceId: string) => {
    setDevices(prev => prev.filter(device => device.id !== deviceId));
  };

  const onlineCount = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Monitor className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Device Monitor</h1>
          </div>
          <p className="text-lg text-gray-600">Monitor your network devices in real-time</p>
        </div>

        {/* Auto-ping Status */}
        <div className="flex justify-center mb-6">
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {autoPingEnabled ? (
                    <Play className="h-4 w-4 text-green-600" />
                  ) : (
                    <Pause className="h-4 w-4 text-gray-600" />
                  )}
                  <span className={`font-medium ${autoPingEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                    Auto-ping: {autoPingEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {autoPingEnabled && (
                  <span className="text-sm text-gray-500">
                    Every {pingInterval}s (staggered by {staggerDelay}s)
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{devices.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{onlineCount}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Offline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{offlineCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <Button 
            onClick={() => setAutoPingEnabled(!autoPingEnabled)}
            className={`px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
              autoPingEnabled 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {autoPingEnabled ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Auto-ping
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Auto-ping
              </>
            )}
          </Button>
          
          <Button 
            onClick={pingAllDevices}
            disabled={autoPingEnabled}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
          >
            <Activity className="h-4 w-4 mr-2" />
            Ping All Now
          </Button>
          
          <Button 
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-8">
            <Card className="bg-white/90 backdrop-blur border-0 shadow-lg max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Auto-ping Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pingInterval" className="text-sm font-medium text-gray-700">
                    Ping Interval (seconds)
                  </Label>
                  <Select value={pingInterval.toString()} onValueChange={(value) => setPingInterval(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="120">2 minutes</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="600">10 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="staggerDelay" className="text-sm font-medium text-gray-700">
                    Stagger Delay (seconds)
                  </Label>
                  <Select value={staggerDelay.toString()} onValueChange={(value) => setStaggerDelay(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 second</SelectItem>
                      <SelectItem value="2">2 seconds</SelectItem>
                      <SelectItem value="3">3 seconds</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4 text-sm text-gray-600">
                  <p><strong>Ping Interval:</strong> How often to check all devices</p>
                  <p><strong>Stagger Delay:</strong> Delay between each device ping to reduce network load</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Device Form */}
        {showAddForm && (
          <div className="mb-8">
            <AddDeviceForm 
              onAdd={addDevice}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Device Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              onPing={() => pingDevice(device.id)}
              onRemove={() => removeDevice(device.id)}
            />
          ))}
        </div>

        {devices.length === 0 && (
          <div className="text-center py-12">
            <Monitor className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No devices added yet</h3>
            <p className="text-gray-500 mb-6">Add your first device to start monitoring</p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Device
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
