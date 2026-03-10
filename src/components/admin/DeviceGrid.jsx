import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Wifi, WifiOff, Settings, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function DeviceGrid({ devices, isLoading, onUpdateStatus }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'online' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Device Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Monitor className="w-6 h-6" />
          Device Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {devices.map((device, index) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {device.device_name}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{device.location}</span>
                  </div>
                </div>
                <Badge className={`${getStatusColor(device.status)} flex items-center gap-1`}>
                  {getStatusIcon(device.status)}
                  {device.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div>IP: {device.ip_address || 'Not set'}</div>
                <div>
                  Last Active: {device.last_active 
                    ? new Date(device.last_active).toLocaleString()
                    : 'Never'
                  }
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onUpdateStatus(device.id, 
                    device.status === 'online' ? 'offline' : 'online'
                  )}
                  className="flex-1"
                >
                  {device.status === 'online' ? 'Set Offline' : 'Set Online'}
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {devices.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No devices registered</p>
            <p>Add your first device to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}