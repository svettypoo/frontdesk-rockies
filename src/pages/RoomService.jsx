import React, { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Plus, Minus, X, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

const CATEGORIES = ["All", "Mains", "Salads", "Sides", "Desserts", "Drinks"];

export default function RoomService() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState({}); // { [itemId]: qty }
  const [cartOpen, setCartOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [roomNumber, setRoomNumber] = useState(
    () => localStorage.getItem("rl_room_number") || ""
  );
  const [guestName, setGuestName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("fd_menu_items")
      .select("*")
      .eq("available", true)
      .order("sort_order", { ascending: true });
    if (!error) setMenuItems(data || []);
    setLoading(false);
  };

  const filteredItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter(
          (item) => item.category?.toLowerCase() === activeCategory.toLowerCase()
        );

  const addToCart = (item) => {
    setCart((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const removeFromCart = (item) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[item.id] > 1) next[item.id]--;
      else delete next[item.id];
      return next;
    });
  };

  const removeItemFromCart = (itemId) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const cartItems = menuItems.filter((item) => cart[item.id] > 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * cart[item.id],
    0
  );

  const handleOrder = async () => {
    setError(null);
    if (!roomNumber.trim()) {
      setError("Please enter your room number.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    try {
      localStorage.setItem("rl_room_number", roomNumber.trim());
      const items = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: cart[item.id],
      }));
      const { error: dbError } = await supabase.from("fd_orders").insert([
        {
          room_number: roomNumber.trim(),
          guest_name: guestName.trim() || null,
          items,
          total: cartTotal,
          special_instructions: specialInstructions.trim() || null,
          status: "received",
        },
      ]);
      if (dbError) throw dbError;
      setSubmitted(true);
      setCartOpen(false);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-green-400/20 rounded-full flex items-center justify-center mb-6 mx-auto ring-4 ring-green-400/40">
            <CheckCircle className="w-12 h-12 text-green-300" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Order Placed!</h2>
          <p className="text-white/70 text-lg mb-2">Your food is on its way.</p>
          <p className="text-white/50 text-sm mb-10">
            Room {roomNumber} · ${cartTotal.toFixed(2)}
          </p>
          <Link
            to={createPageUrl("GuestInterface")}
            className="bg-white/20 hover:bg-white/30 active:bg-white/10 text-white font-semibold px-8 py-3 rounded-2xl transition-all duration-200"
          >
            Go Back
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-8 pb-28">
        {/* Header */}
        <div className="w-full max-w-2xl mb-4">
          <Link
            to={createPageUrl("GuestInterface")}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 w-full max-w-2xl"
        >
          <span className="text-5xl mb-2 block">🍽️</span>
          <h1 className="text-3xl font-bold text-white">Room Service</h1>
          <p className="text-white/50 text-sm mt-1">Delivered straight to your door</p>
        </motion.div>

        {/* Category Tabs */}
        <div className="w-full max-w-2xl mb-5 overflow-x-auto">
          <div className="flex gap-2 pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        {loading ? (
          <div className="text-white/50 text-center py-16">Loading menu…</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-white/40 text-center py-16">
            No items in this category yet.
          </div>
        ) : (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 gap-3 w-full max-w-2xl"
          >
            {filteredItems.map((item) => {
              const qty = cart[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-white text-base">{item.name}</h3>
                        {item.description && (
                          <p className="text-white/50 text-sm mt-0.5 leading-snug">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span className="text-orange-300 font-bold text-base flex-shrink-0">
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {qty > 0 && (
                      <>
                        <button
                          onClick={() => removeFromCart(item)}
                          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-bold w-5 text-center">{qty}</span>
                      </>
                    )}
                    <button
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.button
            key="cart-btn"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.3 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-200"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>View Cart ({cartCount})</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-lg">
              ${cartTotal.toFixed(2)}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            key="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-end justify-center"
            onClick={(e) => e.target === e.currentTarget && setCartOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-2xl bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                    >
                      <div className="flex-1">
                        <span className="font-semibold text-gray-800">{item.name}</span>
                        <span className="text-gray-400 text-sm ml-2">
                          ${Number(item.price).toFixed(2)} each
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item)}
                          className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-gray-700 w-5 text-center">
                          {cart[item.id]}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItemFromCart(item.id)}
                          className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-gray-800 w-14 text-right">
                        ${(item.price * cart[item.id]).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-3 border-t border-gray-100">
                  <span className="font-semibold text-gray-600">Total</span>
                  <span className="text-xl font-bold text-gray-800">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>

                {/* Room & Guest */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Room Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="e.g. 204"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Your Name <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. John Smith"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Special Instructions <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Allergies, preferences…"
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Place Order */}
              <div className="p-5 border-t border-gray-100">
                <button
                  onClick={handleOrder}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-bold py-4 rounded-2xl shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-lg"
                >
                  {submitting ? "Placing Order…" : `Place Order · $${cartTotal.toFixed(2)}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
