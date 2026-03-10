import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

const STATUS_OPTIONS = [
  {
    value: "dnd",
    label: "Do Not Disturb",
    emoji: "🚫",
    description: "Please do not enter my room",
    color: "from-red-500 to-rose-600",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
  },
  {
    value: "clean_requested",
    label: "Please Clean My Room",
    emoji: "🧹",
    description: "I'd like housekeeping service",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
  },
];

export default function Housekeeping() {
  const [roomNumber, setRoomNumber] = useState(
    () => localStorage.getItem("rl_room_number") || ""
  );
  const [guestNotes, setGuestNotes] = useState("");
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);

  // Fetch current status when room number is known
  useEffect(() => {
    if (roomNumber.trim()) {
      fetchStatus(roomNumber.trim());
    }
  }, []);

  const fetchStatus = async (room) => {
    setFetching(true);
    const { data } = await supabase
      .from("fd_housekeeping")
      .select("*")
      .eq("room_number", room)
      .maybeSingle();
    if (data) {
      setCurrentStatus(data.status);
      setGuestNotes(data.guest_notes || "");
    }
    setFetching(false);
  };

  const handleRoomBlur = () => {
    const room = roomNumber.trim();
    if (room) {
      localStorage.setItem("rl_room_number", room);
      fetchStatus(room);
    }
  };

  const handleStatusSelect = async (statusValue) => {
    setError(null);
    if (!roomNumber.trim()) {
      setError("Please enter your room number first.");
      return;
    }

    setLoading(true);
    try {
      localStorage.setItem("rl_room_number", roomNumber.trim());

      const { error: dbError } = await supabase.from("fd_housekeeping").upsert(
        {
          room_number: roomNumber.trim(),
          status: statusValue,
          guest_notes: guestNotes.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "room_number" }
      );

      if (dbError) throw dbError;

      setCurrentStatus(statusValue);
      setConfirmed(statusValue);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStatusOption = STATUS_OPTIONS.find((s) => s.value === currentStatus);
  const confirmedOption = STATUS_OPTIONS.find((s) => s.value === confirmed);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white relative">
      <div className="flex flex-col items-center min-h-screen px-4 py-8">
        {/* Back */}
        <div className="w-full max-w-lg mb-4">
          <Link
            to={createPageUrl("GuestInterface")}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 w-full max-w-lg"
        >
          <span className="text-5xl mb-2 block">🛎️</span>
          <h1 className="text-3xl font-bold text-gray-800">Housekeeping</h1>
          <p className="text-gray-500 text-sm mt-1">Let us know how we can help</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-lg space-y-5"
        >
          {/* Room Number */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Room Number
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              onBlur={handleRoomBlur}
              placeholder="Enter your room number"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-lg"
            />
          </div>

          {/* Current Status */}
          {!fetching && currentStatusOption && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl border ${currentStatusOption.border} ${currentStatusOption.bg} p-4 flex items-center gap-3`}
            >
              <span className="text-2xl">{currentStatusOption.emoji}</span>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                  Current Status
                </div>
                <div className={`font-bold ${currentStatusOption.text}`}>
                  {currentStatusOption.label}
                </div>
              </div>
            </motion.div>
          )}

          {/* Optional Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes for Housekeeping{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={guestNotes}
              onChange={(e) => setGuestNotes(e.target.value)}
              placeholder="Any special requests or timing preferences…"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {STATUS_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleStatusSelect(option.value)}
                disabled={loading}
                className={`w-full bg-gradient-to-r ${option.color} text-white rounded-2xl shadow-lg p-5 flex items-center gap-4 text-left transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <span className="text-4xl">{option.emoji}</span>
                <div>
                  <div className="font-bold text-lg leading-tight">{option.label}</div>
                  <div className="text-white/70 text-sm mt-0.5">{option.description}</div>
                </div>
                {currentStatus === option.value && (
                  <div className="ml-auto flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white/80" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Confirmation */}
          <AnimatePresence>
            {confirmed && confirmedOption && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-2xl border ${confirmedOption.border} ${confirmedOption.bg} p-4 flex items-center gap-3`}
              >
                <CheckCircle className={`w-6 h-6 ${confirmedOption.text} flex-shrink-0`} />
                <div>
                  <div className={`font-bold ${confirmedOption.text}`}>
                    {confirmedOption.label}
                  </div>
                  <div className="text-gray-500 text-sm">
                    Room {roomNumber} — housekeeping has been notified.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
