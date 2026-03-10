import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Map, Phone, Calendar, CreditCard, Wifi, Clock, Info, Wrench, UtensilsCrossed, Bot, MapPin, BedDouble } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { registerPlugin } from "@capacitor/core";

const Kiosk = registerPlugin("Kiosk");

export default function GuestInterface() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const tapTimes = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCornerTap = () => {
    const now = Date.now();
    tapTimes.current = tapTimes.current.filter(t => now - t < 3000);
    tapTimes.current.push(now);
    if (tapTimes.current.length >= 15) {
      tapTimes.current = [];
      Kiosk.exitKiosk().catch(() => {});
    }
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const formatDate = (date) =>
    date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-800 relative overflow-hidden">
      {/* Hidden staff exit zone — tap 15 times within 3 seconds to exit kiosk mode */}
      <div
        onClick={handleCornerTap}
        className="absolute top-0 right-0 w-20 h-20 z-50"
        style={{ WebkitTapHighlightColor: "transparent" }}
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8 w-full max-w-4xl"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-4xl">🏔️</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              The Rockies Lodge
            </h1>
          </div>
          <p className="text-xl text-white/80 font-light mb-6">
            Welcome — How can we assist you today?
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 text-center">
              <div className="text-2xl font-bold text-white">{formatTime(currentTime)}</div>
              <div className="text-sm text-white/70">{formatDate(currentTime)}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 text-sm text-white/90 space-y-1">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                WiFi: <span className="font-semibold">RockiesLodge_Guest</span> · Pass: <span className="font-semibold">Mountains2024</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Check-out: <span className="font-semibold">11:00 AM</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl w-full mb-6"
        >
          <Link to={createPageUrl("VideoChat")}>
            <Card className="group hover:scale-105 active:scale-95 transition-all duration-200 bg-white/90 border-0 shadow-2xl cursor-pointer h-full">
              <CardContent className="p-7 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Speak with Staff</h3>
                <p className="text-sm text-gray-500">Connect with front desk via video call</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("HotelMap")}>
            <Card className="group hover:scale-105 active:scale-95 transition-all duration-200 bg-white/90 border-0 shadow-2xl cursor-pointer h-full">
              <CardContent className="p-7 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Map className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Hotel Map</h3>
                <p className="text-sm text-gray-500">Find restaurants, amenities & directions</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Bookings")}>
            <Card className="group hover:scale-105 active:scale-95 transition-all duration-200 bg-white/90 border-0 shadow-2xl cursor-pointer h-full">
              <CardContent className="p-7 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Amenity Bookings</h3>
                <p className="text-sm text-gray-500">Reserve hot tub, parking or lockers</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("PaymentCheck")}>
            <Card className="group hover:scale-105 active:scale-95 transition-all duration-200 bg-white/90 border-0 shadow-2xl cursor-pointer h-full">
              <CardContent className="p-7 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">My Bill</h3>
                <p className="text-sm text-gray-500">View and pay outstanding charges</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("HotelInfo")}>
            <Card className="group hover:scale-105 active:scale-95 transition-all duration-200 bg-white/90 border-0 shadow-2xl cursor-pointer h-full">
              <CardContent className="p-7 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Info className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Hotel Info</h3>
                <p className="text-sm text-gray-500">Hours, services & local attractions</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("MaintenanceRequest")}>
            <Card className="group hover:scale-105 active:scale-95 transition-all duration-200 bg-white/90 border-0 shadow-2xl cursor-pointer h-full">
              <CardContent className="p-7 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Wrench className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Report Issue</h3>
                <p className="text-sm text-gray-500">Maintenance, cleaning or repairs</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("RoomService")}>
            <Card className="group hover:scale-105 active:scale-95 transition-all duration-200 bg-white/90 border-0 shadow-2xl cursor-pointer h-full">
              <CardContent className="p-7 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <UtensilsCrossed className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Room Service</h3>
                <p className="text-sm text-gray-500">Order food and drinks to your room</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("ChatBot")}>
            <Card className="group hover:scale-105 active:scale-95 transition-all duration-200 bg-white/90 border-0 shadow-2xl cursor-pointer h-full">
              <CardContent className="p-7 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">AI Concierge</h3>
                <p className="text-sm text-gray-500">Ask me anything about the hotel</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Concierge")}>
            <Card className="group hover:scale-105 active:scale-95 transition-all duration-200 bg-white/90 border-0 shadow-2xl cursor-pointer h-full">
              <CardContent className="p-7 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Local Guide</h3>
                <p className="text-sm text-gray-500">Restaurants, trails & activities nearby</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Housekeeping")}>
            <Card className="group hover:scale-105 active:scale-95 transition-all duration-200 bg-white/90 border-0 shadow-2xl cursor-pointer h-full">
              <CardContent className="p-7 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <BedDouble className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Housekeeping</h3>
                <p className="text-sm text-gray-500">Do not disturb or request cleaning</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-red-50/90 border-2 border-red-200 shadow-2xl">
            <CardContent className="p-7 text-center h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Emergency</h3>
              <p className="text-sm text-red-600 font-semibold">Dial 0 · Available 24/7</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white/50 text-sm"
        >
          The Rockies Lodge · 1 Alpine Drive, Canmore, AB · (403) 555-0100
        </motion.div>
      </div>
    </div>
  );
}
