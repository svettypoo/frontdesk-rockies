import React, { useState, useEffect } from "react";
import { Device, ChatSession } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Plus, Info } from "lucide-react";
import { motion } from "framer-motion";

import DeviceGrid from "../components/admin/DeviceGrid";
import ActiveSessions from "../components/admin/ActiveSessions";
import SystemStats from "../components/admin/SystemStats";

export default function AdminDashboard() {
  const [devices, setDevices] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [devicesData, sessionsData] = await Promise.all([
        Device.list('-updated_date'),
        ChatSession.filter({ status: 'active' }, '-created_date')
      ]);
      
      setDevices(devicesData);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeviceStatus = async (deviceId, status) => {
    await Device.update(deviceId, { 
      status,
      last_active: new Date().toISOString()
    });
    loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                System Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Monitor and manage all hotel assistance devices
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Device
            </Button>
          </div>
        </motion.div>

        {/* Kiosk Setup Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start"
        >
          <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 mb-1">Kiosk Exit (Staff Only)</p>
            <p className="text-sm text-amber-700">
              To exit kiosk mode on a tablet, tap the <strong>top-right corner of the screen 15 times</strong> within 3 seconds.
              The device will return to the Android home screen. If Device Owner mode was set up via ADB, this is the only
              software exit — otherwise the Home button also works. To re-enter kiosk mode, simply open the app again.
            </p>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <SystemStats devices={devices} sessions={sessions} isLoading={isLoading} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Device Management */}
          <div className="lg:col-span-2">
            <DeviceGrid 
              devices={devices}
              isLoading={isLoading}
              onUpdateStatus={updateDeviceStatus}
            />
          </div>

          {/* Active Sessions */}
          <div>
            <ActiveSessions 
              sessions={sessions}
              devices={devices}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}