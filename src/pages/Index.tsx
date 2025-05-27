
import React, { useState, useEffect } from 'react';
import { DeviceCard } from '@/components/DeviceCard';
import { AddDeviceForm } from '@/components/AddDeviceForm';
import { Monitor, Plus, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const pingAllDevices = async () => {
    const promises = devices.map(device => pingDevice(device.id));
    await Promise.all(promises);
  };

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
            onClick={pingAllDevices}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Activity className="h-4 w-4 mr-2" />
            Ping All Devices
          </Button>
          
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>

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
