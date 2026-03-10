import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const timeSlots = [
  "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
  "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00",
  "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00",
  "20:00-21:00", "21:00-22:00"
];

export default function BookingForm({ bookingType, onSubmit, onCancel, isSubmitting, defaultGuestName = "" }) {
  const [formData, setFormData] = useState({
    guest_name: defaultGuestName,
    guest_email: "",
    room_number: "",
    booking_date: null,
    booking_time: "",
    notes: ""
  });

  const normalizedType = bookingType === 'hottub' ? 'hot_tub' : bookingType;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      booking_type: normalizedType,
      booking_date: formData.booking_date ? format(formData.booking_date, 'yyyy-MM-dd') : null
    });
  };

  const isFormValid = formData.guest_name && formData.guest_email &&
                      formData.room_number && formData.booking_date &&
                      (normalizedType !== 'hot_tub' || formData.booking_time);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl mx-auto"
    >
      <Button
        variant="ghost"
        onClick={onCancel}
        className="mb-6 -ml-2 hover:bg-gray-100 rounded-xl"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Selection
      </Button>

      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Complete Your Booking
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="guest_name" className="text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </Label>
            <Input
              id="guest_name"
              value={formData.guest_name}
              onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
              className="h-12 rounded-xl border-gray-300"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <Label htmlFor="guest_email" className="text-sm font-semibold text-gray-700 mb-2">
              Email Address *
            </Label>
            <Input
              id="guest_email"
              type="email"
              value={formData.guest_email}
              onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
              className="h-12 rounded-xl border-gray-300"
              placeholder="john@example.com"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="room_number" className="text-sm font-semibold text-gray-700 mb-2">
            Room Number *
          </Label>
          <Input
            id="room_number"
            value={formData.room_number}
            onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
            className="h-12 rounded-xl border-gray-300"
            placeholder="101"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2">
              Booking Date *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start text-left font-normal rounded-xl border-gray-300"
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-gray-500" />
                  {formData.booking_date ? format(formData.booking_date, 'PPP') : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                <Calendar
                  mode="single"
                  selected={formData.booking_date}
                  onSelect={(date) => setFormData({ ...formData, booking_date: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {bookingType === 'hottub' && (
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2">
                Time Slot *
              </Label>
              <Select
                value={formData.booking_time}
                onValueChange={(value) => setFormData({ ...formData, booking_time: value })}
              >
                <SelectTrigger className="h-12 rounded-xl border-gray-300">
                  <Clock className="mr-2 h-5 w-5 text-gray-500" />
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 mb-2">
            Additional Notes
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="rounded-xl border-gray-300 min-h-24"
            placeholder="Any special requests or requirements..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-14 rounded-xl text-base font-semibold"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="flex-1 h-14 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isSubmitting ? "Submitting..." : "Confirm Booking"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}