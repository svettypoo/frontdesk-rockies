import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, CreditCard, ExternalLink, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";

export default function PaymentCheck() {
  const [roomNumber, setRoomNumber] = useState('');
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function checkPayments(e) {
    e.preventDefault();
    if (!roomNumber.trim()) return;
    setLoading(true);
    setError(null);
    setPayments(null);

    // Look up payment instructions that were sent to a guest from this room
    // We match by guest_name containing room number or by checking fd_sessions device room
    const { data, error: err } = await supabase
      .from('fd_payment_instructions')
      .select('*')
      .or(`guest_name.ilike.%Room ${roomNumber}%,guest_name.ilike.%room ${roomNumber}%,description.ilike.%Room ${roomNumber}%,description.ilike.%room ${roomNumber}%`)
      .in('status', ['pending', 'sent'])
      .order('created_at', { ascending: false });

    if (err) {
      setError('Unable to look up your account. Please contact the front desk.');
    } else {
      setPayments(data || []);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-amber-950 p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to={createPageUrl("GuestInterface")}>
            <button className="mb-4 flex items-center gap-2 text-amber-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-1">💳 My Bill</h1>
          <p className="text-amber-200/70">Enter your room number to view outstanding charges</p>
        </motion.div>

        {/* Room number lookup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6"
        >
          <form onSubmit={checkPayments} className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm text-amber-200 mb-2 font-medium">Room Number</label>
              <input
                type="text"
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                placeholder="e.g. 104"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400 text-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || !roomNumber.trim()}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                {loading ? '⏳' : 'Check'}
              </button>
            </div>
          </form>
          {error && (
            <p className="mt-3 text-red-300 text-sm">{error}</p>
          )}
        </motion.div>

        {/* Results */}
        {payments !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {payments.length === 0 ? (
              <div className="bg-green-500/15 border border-green-400/30 rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-bold text-lg">No Outstanding Charges</h3>
                <p className="text-green-300 text-sm mt-1">Room {roomNumber} has no pending payments.</p>
                <p className="text-white/40 text-xs mt-3">If you believe this is incorrect, please contact the front desk.</p>
              </div>
            ) : (
              <>
                <h2 className="text-white font-semibold text-lg">
                  {payments.length} Pending Charge{payments.length !== 1 ? 's' : ''} — Room {roomNumber}
                </h2>
                {payments.map(p => (
                  <div key={p.id} className="bg-white/10 border border-white/20 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-semibold text-lg">${parseFloat(p.amount).toFixed(2)}</p>
                        <p className="text-amber-200 text-sm">{p.description}</p>
                      </div>
                      <span className="bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full font-medium capitalize">
                        {p.status}
                      </span>
                    </div>
                    {p.guest_name && (
                      <p className="text-white/50 text-xs mb-3">Guest: {p.guest_name}</p>
                    )}
                    {p.stripe_payment_link ? (
                      <a
                        href={p.stripe_payment_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 rounded-xl transition-colors"
                      >
                        <CreditCard className="w-5 h-5" />
                        Pay Now — ${parseFloat(p.amount).toFixed(2)}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <div className="bg-white/5 rounded-xl p-3 text-center text-white/50 text-sm">
                        Payment link pending — staff will send it to your phone or email shortly.
                      </div>
                    )}
                    <p className="text-white/30 text-xs mt-2 text-center">
                      Added {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                <p className="text-white/30 text-xs text-center">
                  Questions about your bill? Contact the front desk or dial 0.
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* Help */}
        {payments === null && (
          <div className="text-center text-white/30 text-sm">
            <p>💡 Enter your room number above to check for any charges that have been added by the front desk.</p>
            <p className="mt-2">You can also pay via the link sent to your email or phone.</p>
          </div>
        )}
      </div>
    </div>
  );
}
