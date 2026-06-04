"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function BookingSection() {
  const today = startOfToday();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Generate next 7 days for the date picker
  const dates = Array.from({ length: 7 }).map((_, i) => addDays(today, i));

  useEffect(() => {
    fetchSlots(selectedDate);
    setSelectedSlot(null); // Reset slot selection when date changes
  }, [selectedDate]);

  const fetchSlots = async (date: Date) => {
    setIsLoading(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const res = await fetch(`/api/slots?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.availableSlots);
        setAllSlots(data.allSlots);
      }
    } catch (error) {
      console.error("Failed to fetch slots", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine price based on time (matching the rate card)
  const getPriceForSlot = (timeStr: string) => {
    const hour = parseInt(timeStr.split(":")[0], 10);
    // Late Night (12AM - 5AM): 1000
    // Morning (5AM - 12PM): 600
    // Afternoon (12PM - 5PM): 400
    // Evening (5PM - 12AM): 800
    if (hour >= 0 && hour < 5) return 1000;
    if (hour >= 5 && hour < 12) return 600;
    if (hour >= 12 && hour < 17) return 400;
    if (hour >= 17 && hour < 24) return 800;
    return 800; // Default fallback
  };

  const handleBookNow = () => {
    if (!selectedSlot) return;
    
    const price = getPriceForSlot(selectedSlot);
    const dateStr = format(selectedDate, "dd MMM yyyy");
    
    const message = `Hello, I would like to book the turf.\n\nDate: ${dateStr}\nSlot: ${selectedSlot}\nPrice: ₹${price}\n\nPlease confirm my booking.`;
    
    // Read configurable admin number from env var exposed to client
    const adminNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || "+917030499191";
    const cleanNumber = adminNumber.replace(/[^0-9+]/g, '');
    
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section id="book" className="py-24 md:py-28 px-6 md:px-12 bg-gray-50 dark:bg-[#081409] transition-colors duration-300 border-t border-black/5 dark:border-white/10">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-12">
          <div className="text-[10px] tracking-[0.16em] uppercase text-brand font-medium mb-4">
            Live Availability
          </div>
          <h2 className="font-display leading-none text-foreground dark:text-white transition-colors duration-300" style={{ fontSize: "clamp(36px,5vw,54px)", letterSpacing: ".01em" }}>
            Book Your <em className="font-serif not-italic italic text-brand">Slot</em>
          </h2>
          <p className="mt-4 text-[14px] text-muted dark:text-white/60 max-w-lg mx-auto">
            Select a date to view real-time availability. Slots are blocked immediately upon confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Date Selection */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-white dark:bg-white/5 border border-card-border dark:border-white/10 rounded-2xl p-6 shadow-sm">
              <h3 className="font-display text-xl mb-4 text-foreground dark:text-white flex items-center gap-2">
                <CalendarIcon size={18} className="text-brand" /> Select Date
              </h3>
              <div className="flex flex-col gap-2">
                {dates.map((date) => {
                  const isSelected = selectedDate.getTime() === date.getTime();
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`text-left px-4 py-3 rounded-xl transition-all duration-200 border flex items-center justify-between ${
                        isSelected 
                          ? "bg-brand/10 border-brand text-brand font-medium" 
                          : "bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5 text-foreground dark:text-white/80"
                      }`}
                    >
                      <span>{format(date, "EEE, MMM d")}</span>
                      {isSelected && <CheckCircle2 size={16} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Slot Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-white/5 border border-card-border dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm min-h-[400px] flex flex-col">
              <h3 className="font-display text-xl mb-6 text-foreground dark:text-white flex items-center gap-2">
                <Clock size={18} className="text-brand" /> Available Slots for {format(selectedDate, "MMM d")}
              </h3>

              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                  <CalendarIcon size={48} className="mb-4 text-muted dark:text-white/40" />
                  <p className="text-foreground dark:text-white font-medium">No slots available</p>
                  <p className="text-sm text-muted dark:text-white/60">Fully booked for this date.</p>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                    {allSlots.map((slot) => {
                      const isAvailable = availableSlots.includes(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          disabled={!isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`
                            py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200 border text-center
                            ${!isAvailable ? "opacity-30 cursor-not-allowed bg-gray-100 dark:bg-white/5 border-transparent text-gray-500 dark:text-gray-400" : ""}
                            ${isAvailable && !isSelected ? "bg-white dark:bg-transparent border-gray-200 dark:border-white/20 hover:border-brand hover:text-brand text-foreground dark:text-white cursor-pointer" : ""}
                            ${isSelected ? "bg-brand border-brand text-white shadow-md shadow-brand/20 scale-105" : ""}
                          `}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Booking Summary & Action */}
              <div className={`mt-auto pt-6 border-t border-black/5 dark:border-white/10 transition-all duration-300 ${selectedSlot ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {selectedSlot && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-brand/5 dark:bg-brand/10 p-5 rounded-xl border border-brand/20">
                    <div>
                      <div className="text-[12px] text-muted dark:text-white/60 uppercase tracking-wider mb-1 font-medium">Selected Slot</div>
                      <div className="font-display text-2xl text-foreground dark:text-white">
                        {selectedSlot} <span className="text-sm font-sans text-brand ml-2">₹{getPriceForSlot(selectedSlot)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleBookNow}
                      className="w-full sm:w-auto px-8 py-3.5 bg-brand hover:bg-brand-hover text-white rounded-full font-medium tracking-wide flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-lg shadow-brand/25"
                    >
                      Book Now via WhatsApp <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
