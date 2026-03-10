import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BookingCard from "../components/bookings/BookingCard";
import BookingForm from "../components/bookings/BookingForm";
import BookingsList from "../components/bookings/BookingsList";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Bookings() {
  const [selectedType, setSelectedType] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => { const { data } = await supabase.from('fd_bookings').select('*').order('created_at', { ascending: false }); return data || []; },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData) => { const { data, error } = await supabase.from('fd_bookings').insert(bookingData).select().single(); if (error) throw error; return data; },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setSelectedType(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (id) => { const { error } = await supabase.from('fd_bookings').update({ status: 'cancelled' }).eq('id', id); if (error) throw error; },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const handleBookingSubmit = (bookingData) => {
    createBookingMutation.mutate(bookingData);
  };

  const handleCancelBooking = (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to={createPageUrl("GuestInterface")}>
            <Button variant="ghost" className="mb-4 hover:bg-white/50 rounded-xl">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Amenity Bookings
          </h1>
          <p className="text-xl text-gray-600">
            Reserve hot tub time, parking spots, or storage lockers
          </p>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-8 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900 text-lg">Booking Confirmed!</h3>
                  <p className="text-green-700">Your reservation has been submitted successfully.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs defaultValue="new" className="space-y-8">
          <TabsList className="bg-white/70 backdrop-blur-sm p-2 rounded-2xl shadow-lg border-0">
            <TabsTrigger value="new" className="rounded-xl px-8 py-3 text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              New Booking
            </TabsTrigger>
            <TabsTrigger value="my-bookings" className="rounded-xl px-8 py-3 text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              My Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-8">
            <AnimatePresence mode="wait">
              {!selectedType ? (
                <motion.div
                  key="selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid md:grid-cols-3 gap-8"
                >
                  <BookingCard type="hottub" onClick={() => setSelectedType('hottub')} />
                  <BookingCard type="parking" onClick={() => setSelectedType('parking')} />
                  <BookingCard type="locker" onClick={() => setSelectedType('locker')} />
                </motion.div>
              ) : (
                <BookingForm
                  key="form"
                  bookingType={selectedType}
                  onSubmit={handleBookingSubmit}
                  onCancel={() => setSelectedType(null)}
                  isSubmitting={createBookingMutation.isPending}
                />
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="my-bookings" className="mt-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <BookingsList
                bookings={bookings}
                onCancel={handleCancelBooking}
                isLoading={cancelBookingMutation.isPending}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}