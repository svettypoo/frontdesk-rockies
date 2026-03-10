import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Map, Phone, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function GuestInterface() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Welcome
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 font-light mb-8">
            How can we assist you today?
          </p>
          
          {/* Time Display */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 inline-block">
            <div className="text-3xl font-bold text-white mb-1">
              {formatTime(currentTime)}
            </div>
            <div className="text-lg text-white/80">
              {formatDate(currentTime)}
            </div>
          </div>
        </motion.div>

        {/* Main Options */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl w-full"
        >
          {/* Video Chat Option */}
          <Link to={createPageUrl("VideoChat")}>
            <Card className="group hover:scale-105 transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl cursor-pointer">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Video className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  Speak with Staff
                </h3>
                <p className="text-lg text-gray-600">
                  Connect instantly with our front desk for personalized assistance
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Map Option */}
          <Card className="group hover:scale-105 transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl cursor-pointer">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <Map className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Hotel Map & Directions
              </h3>
              <p className="text-lg text-gray-600">
                Explore hotel facilities, find restaurants, and get directions
              </p>
            </CardContent>
          </Card>

          {/* Bookings Option */}
          <Link to={createPageUrl("Bookings")}>
            <Card className="group hover:scale-105 transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl cursor-pointer">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  Amenity Bookings
                </h3>
                <p className="text-lg text-gray-600">
                  Reserve hot tub, parking, or lockers for your stay
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Emergency Contact */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12"
        >
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 hover:text-white transition-all duration-300 px-8 py-4 text-lg rounded-2xl"
          >
            <Phone className="w-6 h-6 mr-3" />
            Emergency: Dial 0
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="absolute bottom-8 text-center text-white/70 text-lg"
        >
          <p>Available 24/7 for your comfort and convenience</p>
        </motion.div>
      </div>
    </div>
  );
}