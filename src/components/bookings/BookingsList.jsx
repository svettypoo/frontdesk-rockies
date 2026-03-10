import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Waves, Car, Lock, Calendar, Clock, MapPin, X } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const bookingIcons = {
  hottub: Waves,
  parking: Car,
  locker: Lock
};

const bookingLabels = {
  hottub: "Hot Tub",
  parking: "Parking",
  locker: "Locker"
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function BookingsList({ bookings, onCancel, isLoading }) {
  if (!bookings || bookings.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg text-gray-600">No bookings yet</p>
          <p className="text-sm text-gray-500 mt-2">Your reservations will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {bookings.map((booking) => {
          const Icon = bookingIcons[booking.booking_type];
          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {bookingLabels[booking.booking_type]}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Room {booking.room_number}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${statusColors[booking.status]} border font-semibold`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">
                        {format(new Date(booking.booking_date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    {booking.booking_time && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{booking.booking_time}</span>
                      </div>
                    )}
                    {booking.parking_spot && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Spot {booking.parking_spot}</span>
                      </div>
                    )}
                    {booking.locker_number && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Lock className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Locker #{booking.locker_number}</span>
                      </div>
                    )}
                  </div>

                  {booking.notes && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-sm text-gray-600 italic">{booking.notes}</p>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCancel(booking.id)}
                      disabled={isLoading}
                      className="w-full mt-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel Booking
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}