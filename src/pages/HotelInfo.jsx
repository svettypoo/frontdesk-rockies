import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Clock, Phone, Wifi, Star } from "lucide-react";
import { motion } from "framer-motion";

const sections = [
  {
    id: 'hours',
    title: 'Hours & Services',
    icon: '🕐',
    items: [
      { label: 'Front Desk', value: 'Open 24/7 · Dial 0', icon: '🛎️' },
      { label: 'Summit Kitchen Restaurant', value: '7:00 AM – 10:00 PM', icon: '🍽️' },
      { label: 'Hot Tub & Pool', value: '6:00 AM – 11:00 PM', icon: '♨️' },
      { label: 'Fitness Centre', value: 'Open 24/7', icon: '🏋️' },
      { label: 'Ski Locker Room', value: '5:00 AM – 10:00 PM', icon: '🎿' },
      { label: 'Parking', value: 'Open 24/7 · Spots A1–A30', icon: '🅿️' },
      { label: 'Housekeeping', value: '8:00 AM – 4:00 PM', icon: '🧹' },
    ]
  },
  {
    id: 'policies',
    title: 'Hotel Policies',
    icon: '📋',
    items: [
      { label: 'Check-in', value: '3:00 PM', icon: '✅' },
      { label: 'Check-out', value: '11:00 AM', icon: '🕚' },
      { label: 'Late Check-out', value: 'Available · $30/hr (contact front desk)', icon: '💬' },
      { label: 'Pets', value: 'Not permitted', icon: '🐾' },
      { label: 'Smoking', value: 'Non-smoking property. Designated area outside.', icon: '🚭' },
      { label: 'Noise', value: 'Quiet hours 10:00 PM – 8:00 AM', icon: '🔇' },
      { label: 'Luggage Storage', value: 'Available at front desk', icon: '🧳' },
    ]
  },
  {
    id: 'wifi',
    title: 'WiFi & Tech',
    icon: '📶',
    items: [
      { label: 'Guest Network', value: 'RockiesLodge_Guest', icon: '📶' },
      { label: 'Password', value: 'Mountains2024', icon: '🔑' },
      { label: 'Premium Network', value: 'RockiesLodge_Premium (faster)', icon: '⚡' },
      { label: 'Premium Password', value: 'Alpine2024!' },
      { label: 'Coverage', value: 'Full property including pool area', icon: '✅' },
    ]
  },
  {
    id: 'dining',
    title: 'Summit Kitchen Menu',
    icon: '🍽️',
    items: [
      { label: 'Breakfast', value: '7:00 AM – 11:00 AM', icon: '🥞' },
      { label: 'Lunch', value: '11:30 AM – 3:00 PM', icon: '🥗' },
      { label: 'Dinner', value: '5:00 PM – 10:00 PM', icon: '🥩' },
      { label: 'Happy Hour', value: '4:00 PM – 6:00 PM · Bar menu only', icon: '🍺' },
      { label: 'Room Service', value: '7:00 AM – 10:00 PM · Dial 1', icon: '🛏️' },
      { label: 'Dietary Options', value: 'Vegan, gluten-free available · ask staff', icon: '🌱' },
    ]
  },
  {
    id: 'area',
    title: 'Local Attractions',
    icon: '🗻',
    items: [
      { label: 'Banff National Park', value: '10 min drive · Parks Canada day pass required', icon: '🏔️' },
      { label: 'Canmore Nordic Centre', value: '5 min drive · Skiing & trails', icon: '⛷️' },
      { label: 'Bow River Walk', value: '0.5 km · 10 min walk from hotel', icon: '🚶' },
      { label: 'Canmore Town Centre', value: '1.2 km · Shops & restaurants', icon: '🛍️' },
      { label: 'Lake Minnewanka', value: '25 min drive · Swimming & boating', icon: '🚣' },
      { label: 'Shuttle Service', value: 'To/from Canmore: 8am, 12pm, 5pm · Dial 2', icon: '🚐' },
    ]
  },
  {
    id: 'contacts',
    title: 'Useful Numbers',
    icon: '📞',
    items: [
      { label: 'Front Desk', value: 'Dial 0 · Always available', icon: '🛎️' },
      { label: 'Room Service', value: 'Dial 1 · 7am–10pm', icon: '🍽️' },
      { label: 'Shuttle Booking', value: 'Dial 2', icon: '🚐' },
      { label: 'Maintenance', value: 'Dial 3', icon: '🔧' },
      { label: 'Housekeeping', value: 'Dial 4 · 8am–4pm', icon: '🧹' },
      { label: 'Emergency Services', value: '911', icon: '🚨' },
      { label: 'Hotel Direct Line', value: '(403) 555-0100', icon: '📱' },
    ]
  },
];

export default function HotelInfo() {
  const [activeSection, setActiveSection] = useState('hours');
  const section = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-rose-950 p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link to={createPageUrl("GuestInterface")}>
            <button className="mb-4 flex items-center gap-2 text-rose-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-1">ℹ️ Hotel Info</h1>
          <p className="text-rose-200/70">The Rockies Lodge · Canmore, AB</p>
        </motion.div>

        {/* Section tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeSection === s.id
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'bg-white/10 text-rose-200 hover:bg-white/20'
              }`}
            >
              {s.icon} {s.title}
            </button>
          ))}
        </div>

        {/* Content */}
        {section && (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-white font-bold text-xl">{section.icon} {section.title}</h2>
            </div>
            <div className="divide-y divide-white/10">
              {section.items.map(item => (
                <div key={item.label} className="px-6 py-4 flex items-start gap-4">
                  {item.icon && <span className="text-xl mt-0.5 flex-shrink-0">{item.icon}</span>}
                  <div className="flex-1">
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="text-rose-200/80 text-sm mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Rating strip */}
        <div className="mt-6 text-center text-white/30 text-sm flex items-center justify-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
          </div>
          <span>4-Star Mountain Resort · TripAdvisor Award 2024</span>
        </div>
      </div>
    </div>
  );
}
