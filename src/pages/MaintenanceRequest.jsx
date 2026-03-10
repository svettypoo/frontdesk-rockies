import React, { useState } from "react";
import { ArrowLeft, CheckCircle, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

const ISSUE_TYPES = [
  "Plumbing",
  "Electrical",
  "Heating/Cooling",
  "Cleaning",
  "Noise",
  "Internet/TV",
  "Furniture/Fixtures",
  "Other",
];

export default function MaintenanceRequest() {
  const [form, setForm] = useState({
    room_number: "",
    guest_name: "",
    issue_type: "",
    description: "",
    priority: "normal",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.room_number.trim()) {
      setError("Room number is required.");
      return;
    }
    if (!form.issue_type) {
      setError("Please select an issue type.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: dbError } = await supabase.from("fd_maintenance").insert([
        {
          room_number: form.room_number.trim(),
          guest_name: form.guest_name.trim() || null,
          issue_type: form.issue_type,
          description: form.description.trim() || null,
          priority: form.priority,
          status: "open",
        },
      ]);
      if (dbError) throw dbError;
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-800 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 py-8">
        {/* Header */}
        <div className="w-full max-w-xl mb-6">
          <Link
            to={createPageUrl("GuestInterface")}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
              className="flex flex-col items-center justify-center text-center px-6 py-16"
            >
              <div className="w-24 h-24 bg-green-400/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-green-400/40">
                <CheckCircle className="w-12 h-12 text-green-300" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Request Submitted</h2>
              <p className="text-white/70 text-lg mb-2">We'll send someone shortly.</p>
              <p className="text-white/50 text-sm mb-10">
                Room {form.room_number} · {form.issue_type}
              </p>
              <Link
                to={createPageUrl("GuestInterface")}
                className="bg-white/20 hover:bg-white/30 active:bg-white/10 text-white font-semibold px-8 py-3 rounded-2xl transition-all duration-200"
              >
                Go Back
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl"
            >
              {/* Title */}
              <div className="text-center mb-8">
                <span className="text-5xl mb-3 block">🔧</span>
                <h1 className="text-3xl font-bold text-white">Report an Issue</h1>
                <p className="text-white/60 mt-1 text-sm">We'll get it sorted right away</p>
              </div>

              {/* Form Card */}
              <div className="bg-white/95 rounded-3xl shadow-2xl p-7 space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Room Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Room Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="room_number"
                      value={form.room_number}
                      onChange={handleChange}
                      placeholder="e.g. 204"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                    />
                  </div>

                  {/* Guest Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Your Name <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="guest_name"
                      value={form.guest_name}
                      onChange={handleChange}
                      placeholder="e.g. John Smith"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                    />
                  </div>

                  {/* Issue Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Issue Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="issue_type"
                      value={form.issue_type}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition bg-white"
                    >
                      <option value="">Select an issue type…</option>
                      {ISSUE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Description <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe the issue in detail…"
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition resize-none"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Priority
                    </label>
                    <div className="flex gap-3">
                      {["normal", "urgent"].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all duration-200 ${
                            form.priority === p
                              ? p === "urgent"
                                ? "bg-red-500 text-white shadow-md"
                                : "bg-indigo-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {p === "urgent" ? "🚨 Urgent" : "📋 Normal"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold py-4 rounded-2xl shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-lg mt-2"
                  >
                    {submitting ? "Submitting…" : "Submit Request"}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
