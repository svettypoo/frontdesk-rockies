import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, MapPin } from "lucide-react";
import { motion } from "framer-motion";

// All coordinates in a 600x360 viewBox
const floors = [
  { id: 'ground', label: 'Ground Floor' },
  { id: 'floor1', label: 'Floor 1 · Rooms 101–112' },
  { id: 'floor2', label: 'Floor 2 · Rooms 201–212' },
  { id: 'outside', label: 'Grounds & Parking' },
];

const groundAreas = [
  { id: 'restaurant', x: 20, y: 30, w: 140, h: 130, label: 'Summit Kitchen', emoji: '🍽️', sublabel: '7am – 10pm', color: '#D97706' },
  { id: 'lobby',      x: 200, y: 30, w: 180, h: 80,  label: 'Lobby',          emoji: '🏨', color: '#3B82F6' },
  { id: 'frontdesk',  x: 200, y: 120, w: 180, h: 40, label: 'Front Desk',      emoji: '🛎️', color: '#6366F1' },
  { id: 'hottub',     x: 420, y: 30, w: 160, h: 130, label: 'Hot Tub & Pool',  emoji: '♨️', sublabel: '6am – 11pm', color: '#10B981' },
  { id: 'gym',        x: 420, y: 200, w: 160, h: 120, label: 'Fitness Centre',  emoji: '🏋️', sublabel: 'Open 24/7', color: '#8B5CF6' },
  { id: 'locker',     x: 20, y: 200, w: 140, h: 120, label: 'Ski Locker Room', emoji: '🎿', sublabel: '5am – 10pm', color: '#06B6D4' },
  { id: 'elevator',   x: 200, y: 200, w: 70, h: 120, label: 'Elevators',       emoji: '🛗', color: '#64748B' },
  { id: 'corridor',   x: 280, y: 200, w: 130, h: 120, label: 'Corridor',        emoji: '',   color: '#334155' },
];

const makeRooms = (prefix, y) => {
  const rooms = [];
  const cols = 6;
  const roomW = 88;
  const roomH = 100;
  const gapX = 8;
  const startX = 20;
  for (let i = 0; i < 12; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const num = (i + 1).toString().padStart(2, '0');
    rooms.push({
      id: `r${prefix}${num}`,
      x: startX + col * (roomW + gapX),
      y: y + row * (roomH + 8),
      w: roomW, h: roomH,
      label: `${prefix}${num}`,
      color: '#3B82F6',
    });
  }
  // Hallway
  rooms.push({ id: `hall${prefix}`, x: 20, y: y + roomH + 4, w: cols * (roomW + gapX) - gapX, h: 6, label: '', color: '#334155' });
  // Elevator
  rooms.push({ id: `elev${prefix}`, x: 20, y: y + 2 * (roomH + 8) + 10, w: 55, h: 60, label: '🛗 Lift', color: '#64748B' });
  return rooms;
};

const floor1Areas = makeRooms('10', 30);
const floor2Areas = makeRooms('20', 30).map(a => ({
  ...a,
  id: a.id.replace(/^r10/, 'r20').replace('hall10', 'hall20').replace('elev10', 'elev20'),
  label: a.label.replace(/^10/, '20'),
  color: a.color === '#3B82F6' ? '#7C3AED' : a.color,
}));

const outsideAreas = [
  { id: 'parking',  x: 20, y: 20, w: 380, h: 160, label: 'Parking Lot', emoji: '🅿️', sublabel: 'Spots A1 – A30', color: '#475569' },
  { id: 'entrance', x: 200, y: 185, w: 120, h: 50, label: 'Main Entrance', emoji: '🚪', color: '#3B82F6' },
  { id: 'ski',      x: 20, y: 250, w: 150, h: 90, label: 'Outdoor Ski Storage', emoji: '⛷️', color: '#0EA5E9' },
  { id: 'trail',    x: 430, y: 20, w: 150, h: 160, label: 'Trail Head', emoji: '🥾', sublabel: '0.3km to main trail', color: '#16A34A' },
  { id: 'dropoff',  x: 190, y: 250, w: 390, h: 90, label: 'Vehicle Drop-off / Pick-up', emoji: '🚗', color: '#78716C' },
];

const floorData = { ground: groundAreas, floor1: floor1Areas, floor2: floor2Areas, outside: outsideAreas };

function Room({ area, onClick, selected }) {
  const cx = area.x + area.w / 2;
  const cy = area.y + area.h / 2;
  return (
    <g onClick={() => area.label && onClick(area)} style={{ cursor: area.label ? 'pointer' : 'default' }}>
      <rect
        x={area.x} y={area.y} width={area.w} height={area.h}
        rx={4} fill={area.color}
        opacity={selected ? 1 : 0.82}
        stroke={selected ? '#F8FAFC' : 'rgba(255,255,255,0.2)'}
        strokeWidth={selected ? 2 : 1}
      />
      {area.label && (
        <text x={cx} y={area.sublabel ? cy - 8 : cy} textAnchor="middle" dominantBaseline="middle"
          fontSize={area.emoji ? 11 : 13} fontWeight="700" fill="white" style={{ pointerEvents: 'none' }}>
          {area.emoji ? `${area.emoji} ${area.label}` : area.label}
        </text>
      )}
      {area.sublabel && (
        <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle"
          fontSize={9} fill="rgba(255,255,255,0.8)" style={{ pointerEvents: 'none' }}>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 p-5">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <Link to={createPageUrl("GuestInterface")}>
            <button className="mb-3 flex items-center gap-2 text-blue-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" /> Back to Home
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-0.5">🗺️ Hotel Map</h1>
          <p className="text-blue-300 text-sm">The Rockies Lodge · 1 Alpine Drive, Canmore, AB</p>
        </motion.div>

        {/* Floor tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {floors.map(f => (
            <button key={f.id} onClick={() => { setActiveFloor(f.id); setSelected(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFloor === f.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/10 text-blue-200 hover:bg-white/20'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Map */}
        <motion.div key={activeFloor} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700 mb-4">
          <svg viewBox="0 0 600 360" className="w-full rounded-xl" style={{ height: '360px', background: '#0F172A' }}>
            {/* Border */}
            <rect x={8} y={8} width={584} height={344} rx={8} fill="none" stroke="#1E3A5F" strokeWidth={1.5} />
            {areas.map(area => (
              <Room key={area.id} area={area} onClick={setSelected} selected={selected?.id === area.id} />
            ))}
          </svg>
        </motion.div>

        {/* Selected info */}
        {selected && selected.label && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 rounded-xl p-4 border border-white/20 mb-4 flex items-center gap-3">
            <span className="text-3xl">{selected.emoji || '📍'}</span>
            <div>
              <p className="font-bold text-white text-lg">{selected.label}</p>
              {selected.sublabel && <p className="text-blue-300 text-sm">{selected.sublabel}</p>}
            </div>
          </motion.div>
        )}

        {/* Quick ref */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" /> Quick Reference
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {[
              { e: '🛎️', t: 'Front Desk', s: 'Ground Floor · Dial 0' },
              { e: '🍽️', t: 'Summit Kitchen', s: 'Ground · 7am–10pm' },
              { e: '♨️', t: 'Hot Tub & Pool', s: 'Ground · 6am–11pm' },
              { e: '🏋️', t: 'Fitness Centre', s: 'Ground · 24/7' },
              { e: '🎿', t: 'Ski Locker Room', s: 'Ground · 5am–10pm' },
              { e: '🅿️', t: 'Parking', s: 'Grounds · A1–A30' },
            ].map(item => (
              <div key={item.t} className="flex items-start gap-2 text-blue-100">
                <span className="text-base">{item.e}</span>
                <div>
                  <p className="font-medium text-sm">{item.t}</p>
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
