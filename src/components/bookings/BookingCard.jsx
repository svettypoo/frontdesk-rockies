import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Waves, Car, Lock } from "lucide-react";

const bookingTypes = {
  hottub: {
    icon: Waves,
    title: "Hot Tub",
    description: "Relax in our luxury hot tub with stunning mountain views",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50"
  },
  parking: {
    icon: Car,
    title: "Parking Spot",
    description: "Reserve a convenient parking spot near the entrance",
    gradient: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-50 to-indigo-50"
  },
  locker: {
    icon: Lock,
    title: "Storage Locker",
    description: "Secure locker for your ski equipment and belongings",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-50 to-orange-50"
  }
};

export default function BookingCard({ type, onClick }) {
  const config = bookingTypes[type];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        onClick={onClick}
        className={`cursor-pointer overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${config.bgGradient}`}
      >
        <CardContent className="p-8">
          <div className={`w-16 h-16 bg-gradient-to-r ${config.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {config.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {config.description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}