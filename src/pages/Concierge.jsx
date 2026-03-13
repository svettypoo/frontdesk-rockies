import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone, Clock, X, ExternalLink, Beer, UtensilsCrossed, Croissant, Snowflake, Footprints, Mountain, PersonStanding, ShoppingCart, Map } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

const EMOJI_TO_ICON = {
  "🍺": Beer, "🍻": Beer,
  "🍽️": UtensilsCrossed, "🍽": UtensilsCrossed, "🍴": UtensilsCrossed,
  "🥯": Croissant, "🥐": Croissant, "☕": Croissant,
  "⛷️": Snowflake, "⛷": Snowflake, "🎿": Snowflake,
  "🥾": Footprints, "🚶": Footprints, "👟": Footprints,
  "🏔️": Mountain, "🏔": Mountain, "⛰️": Mountain, "⛰": Mountain,
  "🧗": PersonStanding, "🧗‍♂️": PersonStanding, "🏊": PersonStanding,
  "🛒": ShoppingCart, "🛍️": ShoppingCart, "🛍": ShoppingCart,
  "📍": MapPin,
};

function EntryIcon({ emoji, size = "w-5 h-5", color = "text-slate-500" }) {
  const IconComponent = EMOJI_TO_ICON[emoji];
  if (IconComponent) return <IconComponent className={`${size} ${color}`} />;
  return <MapPin className={`${size} ${color}`} />;
}

const CATEGORIES = ["All", "Restaurants", "Breakfast", "Hiking", "Activities", "Recreation", "Shopping"];

const CATEGORY_COLORS = {
  Restaurants: "bg-red-100 text-red-700",
  Breakfast: "bg-yellow-100 text-yellow-700",
  Hiking: "bg-green-100 text-green-700",
  Activities: "bg-blue-100 text-blue-700",
  Recreation: "bg-purple-100 text-purple-700",
  Shopping: "bg-pink-100 text-pink-700",
};

export default function Concierge() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("fd_concierge")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error) setEntries(data || []);
    setLoading(false);
  };

  const filtered =
    activeCategory === "All"
      ? entries
      : entries.filter(
          (e) => e.category?.toLowerCase() === activeCategory.toLowerCase()
        );

  const getMapsUrl = (entry) => {
    const query = encodeURIComponent(entry.address || entry.title);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white relative">
      <div className="flex flex-col items-center min-h-screen px-4 py-8">
        {/* Back */}
        <div className="w-full max-w-2xl mb-4">
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
          className="text-center mb-6 w-full max-w-2xl"
        >
          <span className="mb-2 block"><Map className="w-12 h-12 text-blue-500 mx-auto" /></span>
          <h1 className="text-3xl font-bold text-gray-800">Local Guide</h1>
          <p className="text-gray-500 text-sm mt-1">Discover the best of Canmore & the Rockies</p>
        </motion.div>

        {/* Category Filter */}
        <div className="w-full max-w-2xl mb-5 overflow-x-auto">
          <div className="flex gap-2 pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="text-gray-400 text-center py-16">Loading recommendations…</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-400 text-center py-16">
            No listings in this category yet.
          </div>
        ) : (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 gap-3 w-full max-w-2xl"
          >
            {filtered.map((entry) => (
              <motion.button
                key={entry.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(entry)}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 text-left flex items-start gap-4 hover:shadow-lg transition-shadow duration-200 w-full"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <EntryIcon emoji={entry.emoji} size="w-6 h-6" color="text-gray-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-800 text-base leading-tight">
                      {entry.title}
                    </h3>
                    {entry.distance && (
                      <span className="flex-shrink-0 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        {entry.distance}
                      </span>
                    )}
                  </div>

                  {entry.category && (
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 mb-2 ${
                        CATEGORY_COLORS[entry.category] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {entry.category}
                    </span>
                  )}

                  {entry.description && (
                    <p className="text-gray-500 text-sm leading-snug line-clamp-2">
                      {entry.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 mt-2">
                    {entry.address && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" />
                        {entry.address}
                      </span>
                    )}
                    {entry.hours && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {entry.hours}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm flex items-end justify-center"
            onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-2xl bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <EntryIcon emoji={selected.emoji} size="w-6 h-6" color="text-gray-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selected.title}</h2>
                    {selected.category && (
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                          CATEGORY_COLORS[selected.category] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {selected.category}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition flex-shrink-0"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {selected.description && (
                  <p className="text-gray-600 leading-relaxed">{selected.description}</p>
                )}

                <div className="space-y-3">
                  {selected.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Address</div>
                        <div className="text-gray-700">{selected.address}</div>
                      </div>
                    </div>
                  )}
                  {selected.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Phone</div>
                        <div className="text-gray-700">{selected.phone}</div>
                      </div>
                    </div>
                  )}
                  {selected.hours && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Hours</div>
                        <div className="text-gray-700">{selected.hours}</div>
                      </div>
                    </div>
                  )}
                  {selected.distance && (
                    <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-2">
                      <span className="text-blue-600 font-semibold text-sm">📍 {selected.distance} from hotel</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 border-t border-gray-100 flex gap-3">
                {selected.address && (
                  <a
                    href={getMapsUrl(selected)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Get Directions
                  </a>
                )}
                {selected.url && (
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-bold py-3 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </a>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-500 font-semibold px-5 py-3 rounded-2xl transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
