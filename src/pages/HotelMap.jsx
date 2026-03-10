import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const floors = [
  { id: 'ground', label: 'Ground Floor' },
  { id: 'floor1', label: 'Floor 1 · Rooms 101–112' },
  { id: 'floor2', label: 'Floor 2 · Rooms 201–212' },
  { id: 'outside', label: 'Grounds & Parking' },
];

const groundAreas = [
  { id: 'lobby', x: 35, y: 45, w: 30, h: 20, label: 'Lobby', emoji: '🏨', color: '#3B82F6' },
  { id: 'frontdesk', x: 38, y: 50, w: 12, h: 8, label: 'Front Desk', emoji: '🛎️', color: '#6366F1' },
  { id: 'restaurant', x: 10, y: 35, w: 22, h: 25, label: 'Summit Kitchen', emoji: '🍽️', sublabel: '7am–10pm', color: '#F59E0B' },
  { id: 'hottub', x: 68, y: 35, w: 20, h: 18, label: 'Hot Tub & Pool', emoji: '♨️', sublabel: '6am–11pm', color: '#10B981' },
  { id: 'gym', x: 68, y: 60, w: 20, h: 15, label: 'Fitness Centre', emoji: '🏋️', sublabel: 'Open 24/7', color: '#8B5CF6' },
  { id: 'locker', x: 10, y: 65, w: 22, h: 15, label: 'Ski Locker Room', emoji: '🎿', sublabel: '5am–10pm', color: '#06B6D4' },
  { id: 'elevator', x: 46, y: 70, w: 8, h: 8, label: 'Elevators', emoji: '🛗', color: '#64748B' },
];

const floor1Areas = [
  { id: '101', x: 5, y: 30, w: 12, h: 16, label: '101', color: '#60A5FA' },
  { id: '102', x: 19, y: 30, w: 12, h: 16, label: '102', color: '#60A5FA' },
  { id: '103', x: 33, y: 30, w: 12, h: 16, label: '103', color: '#60A5FA' },
  { id: '104', x: 47, y: 30, w: 12, h: 16, label: '104', color: '#60A5FA' },
  { id: '105', x: 61, y: 30, w: 12, h: 16, label: '105', color: '#60A5FA' },
  { id: '106', x: 75, y: 30, w: 12, h: 16, label: '106', color: '#60A5FA' },
  { id: '107', x: 5, y: 55, w: 12, h: 16, label: '107', color: '#60A5FA' },
  { id: '108', x: 19, y: 55, w: 12, h: 16, label: '108', color: '#60A5FA' },
  { id: '109', x: 33, y: 55, w: 12, h: 16, label: '109', color: '#60A5FA' },
  { id: '110', x: 47, y: 55, w: 12, h: 16, label: '110', color: '#60A5FA' },
  { id: '111', x: 61, y: 55, w: 12, h: 16, label: '111', color: '#60A5FA' },
  { id: '112', x: 75, y: 55, w: 12, h: 16, label: '112', color: '#60A5FA' },
  { id: 'hall1', x: 5, y: 48, w: 82, h: 5, label: 'Hallway', color: '#E2E8F0' },
  { id: 'elev1', x: 45, y: 73, w: 10, h: 8, label: '🛗 Elevators', color: '#94A3B8' },
];

const floor2Areas = floor1Areas.map(a => ({
  ...a,
  id: a.id.replace(/^1(\d\d)$/, '2$1').replace('elev1', 'elev2').replace('hall1', 'hall2'),
  label: a.label.replace(/^1(\d\d)$/, '2$1').replace('🛗 Elevators', '🛗 Elevators'),
  color: a.color === '#60A5FA' ? '#818CF8' : a.color,
}));

const outsideAreas = [
  { id: 'park', x: 10, y: 20, w: 80, h: 40, label: 'Parking Lot', emoji: '🅿️', sublabel: 'Spots A1–A30', color: '#94A3B8' },
  { id: 'entrance', x: 40, y: 62, w: 20, h: 10, label: 'Main Entrance', emoji: '🚪', color: '#3B82F6' },
  { id: 'ski', x: 10, y: 75, w: 25, h: 15, label: 'Ski Storage (Outdoor)', emoji: '⛷️', color: '#0EA5E9' },
  { id: 'trail', x: 65, y: 75, w: 25, h: 15, label: 'Trail Head', emoji: '🥾', sublabel: '0.3km to main trail', color: '#22C55E' },
];

const floorData = { ground: groundAreas, floor1: floor1Areas, floor2: floor2Areas, outside: outsideAreas };

function MapArea({ area, onClick, selected }) {
  return (
    <g onClick={() => onClick(area)} style={{ cursor: 'pointer' }}>
      <rect
        x={`${area.x}%`} y={`${area.y}%`}
        width={`${area.w}%`} height={`${area.h}%`}
        rx="4" ry="4"
        fill={area.color}
        opacity={selected ? 1 : 0.75}
        stroke={selected ? '#1E293B' : '#fff'}
        strokeWidth={selected ? 2 : 1}
      />
      <text
        x={`${area.x + area.w / 2}%`}
        y={`${area.y + area.h / 2 - (area.sublabel ? 2 : 0)}%`}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="10" fontWeight="700" fill="white"
        style={{ pointerEvents: 'none', fontSize: '10px' }}
      >
        {area.emoji ? `${area.emoji} ${area.label}` : area.label}
      </text>
      {area.sublabel && (
        <text
          x={`${area.x + area.w / 2}%`}
          y={`${area.y + area.h / 2 + 4}%`}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="8" fill="rgba(255,255,255,0.85)"
          style={{ pointerEvents: 'none', fontSize: '8px' }}
        >
          {area.sublabel}
        </text>
      )}
    </g>
  );
}

export default function HotelMap() {
  const [activeFloor, setActiveFloor] = useState('ground');
  const [selected, setSelected] = useState(null);

  const areas = floorData[activeFloor] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link to={createPageUrl("GuestInterface")}>
            <button className="mb-4 flex items-center gap-2 text-blue-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-1">🗺️ Hotel Map</h1>
          <p className="text-blue-300">The Rockies Lodge · 1 Alpine Drive, Canmore, AB</p>
        </motion.div>

        {/* Floor selector */}
        <div className="flex gap-2 flex-wrap mb-5">
          {floors.map(f => (
            <button
              key={f.id}
              onClick={() => { setActiveFloor(f.id); setSelected(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFloor === f.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-blue-200 hover:bg-white/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* SVG Map */}
        <motion.div
          key={activeFloor}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700 mb-5"
        >
          <svg viewBox="0 0 100 100" className="w-full" style={{ height: '380px' }}>
            {/* Background floor */}
            <rect x="3" y="15" width="94" height="75" rx="6" fill="#1E293B" />
            {areas.map(area => (
              <MapArea
                key={area.id}
                area={area}
                onClick={setSelected}
                selected={selected?.id === area.id}
              />
            ))}
          </svg>
        </motion.div>

        {/* Selected info */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 rounded-xl p-4 border border-white/20 mb-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selected.emoji || '📍'}</span>
              <div>
                <p className="font-bold text-white text-lg">{selected.label}</p>
                {selected.sublabel && <p className="text-blue-300 text-sm">{selected.sublabel}</p>}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick reference */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" /> Quick Reference
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {[
              { e: '🛎️', t: 'Front Desk', s: 'Ground Floor · Dial 0' },
              { e: '🍽️', t: 'Summit Kitchen', s: 'Ground Floor · 7am–10pm' },
              { e: '♨️', t: 'Hot Tub & Pool', s: 'Ground Floor · 6am–11pm' },
              { e: '🏋️', t: 'Fitness Centre', s: 'Ground Floor · 24/7' },
              { e: '🎿', t: 'Ski Locker Room', s: 'Ground Floor · 5am–10pm' },
              { e: '🅿️', t: 'Parking', s: 'Grounds · Spots A1–A30' },
            ].map(item => (
              <div key={item.t} className="flex items-start gap-2 text-blue-100">
                <span>{item.e}</span>
                <div>
                  <p className="font-medium">{item.t}</p>
                  <p className="text-blue-400 text-xs">{item.s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
