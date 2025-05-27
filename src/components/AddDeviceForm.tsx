
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface AddDeviceFormProps {
  onAdd: (name: string, ipAddress: string) => void;
  onCancel: () => void;
}

export const AddDeviceForm: React.FC<AddDeviceFormProps> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [errors, setErrors] = useState<{ name?: string; ipAddress?: string }>({});

  const validateIP = (ip: string): boolean => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { name?: string; ipAddress?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Device name is required';
    }
    
    if (!ipAddress.trim()) {
      newErrors.ipAddress = 'IP address is required';
    } else if (!validateIP(ipAddress.trim())) {
      newErrors.ipAddress = 'Please enter a valid IP address';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onAdd(name.trim(), ipAddress.trim());
      setName('');
      setIpAddress('');
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur border-0 shadow-lg max-w-md mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-green-600" />
            Add New Device
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deviceName" className="text-sm font-medium text-gray-700">
              Device Name
            </Label>
            <Input
              id="deviceName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Router, Server, Printer"
              className={`transition-all duration-200 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ipAddress" className="text-sm font-medium text-gray-700">
              IP Address
            </Label>
            <Input
              id="ipAddress"
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="e.g., 192.168.1.100"
              className={`font-mono transition-all duration-200 ${errors.ipAddress ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
            />
            {errors.ipAddress && (
              <p className="text-sm text-red-600">{errors.ipAddress}</p>
            )}
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
