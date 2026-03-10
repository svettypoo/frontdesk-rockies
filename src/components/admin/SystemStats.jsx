import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Users, Activity, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function SystemStats({ devices, sessions, isLoading }) {
  const stats = [
    {
      title: "Total Devices",
      value: devices.length,
      icon: Monitor,
      color: "bg-blue-500"
    },
    {
      title: "Online Devices",
      value: devices.filter(d => d.status === 'online').length,
      icon: Activity,
      color: "bg-green-500"
    },
    {
      title: "Active Sessions",
      value: sessions.length,
      icon: Users,
      color: "bg-purple-500"
    },
    {
      title: "Avg Session Time",
      value: "4.2 min",
      icon: Clock,
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-gray-50">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {stat.title}
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${stat.color} bg-opacity-20`}>
                  <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}