import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, MessageSquare, CreditCard, User } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActiveSessions({ sessions, devices, isLoading }) {
  const getSessionIcon = (type) => {
    switch (type) {
      case 'video_chat': return <Video className="w-4 h-4" />;
      case 'support': return <MessageSquare className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getDeviceName = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    return device?.device_name || deviceId;
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-32" />
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
        <CardTitle className="text-xl font-bold">Active Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSessionIcon(session.session_type)}
                  <span className="font-medium text-gray-900">
                    {session.guest_name || 'Guest'}
                  </span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600">
                <div>Device: {getDeviceName(session.device_id)}</div>
                <div>Type: {session.session_type.replace('_', ' ')}</div>
                <div>
                  Started: {new Date(session.created_date).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No active sessions</p>
              <p className="text-sm">Sessions will appear here when guests connect</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}