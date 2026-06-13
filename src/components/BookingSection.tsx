"use client";

import { useState, useEffect } from "react";
import {
  format,
  addDays,
  startOfToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Clock, MessageCircle } from "lucide-react";

/* ── Helpers ───────────────────────────────────────────── */
const formatHour = (slot: string) => {
  const [h] = slot.split(":").map(Number);
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
};

const getPriceForSlot = (slot: string) => {
  const h = parseInt(slot.split(":")[0], 10);
  if (h >= 0 && h < 5) return 1000;
  if (h >= 5 && h < 12) return 600;
  if (h >= 12 && h < 17) return 400;
  return 800;
};

const getPeriodLabel = (slot: string) => {
  const h = parseInt(slot.split(":")[0], 10);
  if (h >= 0 && h < 5) return { label: "Late Night", color: "#6366f1" };
  if (h >= 5 && h < 12) return { label: "Morning", color: "#f59e0b" };
  if (h >= 12 && h < 17) return { label: "Afternoon", color: "#10b981" };
  return { label: "Evening", color: "#27a84e" };
};

/* ── Main Component ────────────────────────────────────── */
export default function BookingSection({ 
  disableMorning = false,
  disableAfternoon = false,
  disableEvening = false,
  disableLateNight = false 
}: { 
  disableMorning?: boolean,
  disableAfternoon?: boolean,
  disableEvening?: boolean,
  disableLateNight?: boolean 
}) {
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<"Football" | "Cricket">("Football");

  useEffect(() => {
    fetchSlots(selectedDate);
    setSelectedSlot(null);
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
    } catch (e) {
      console.error("Failed to fetch slots", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = (slot: string) => {
    const price = getPriceForSlot(slot);
    const slotEnd = `${(parseInt(slot.split(":")[0], 10) + 1).toString().padStart(2, "0")}:00`;
    const dateStr = format(selectedDate, "dd MMM yyyy");
    const message =
      `Hello, I would like to book the turf for playing ${selectedSport}.\n\n` +
      `📅 Date: ${dateStr}\n` +
      `⏰ Slot: ${formatHour(slot)} – ${formatHour(slotEnd)}\n` +
      `💰 Price: ₹${price}\n\n` +
      `Please confirm my booking.`;
    const adminNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || "+917030499191";
    const clean = adminNumber.replace(/[^0-9+]/g, "");
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(message)}`, "_blank");
  };

  /* Calendar grid */
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });
  const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  /* Group slots by period */
  const ALL_PERIODS = [
    { key: "Late Night", hours: [0, 1, 2, 3, 4], color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
    { key: "Morning", hours: [5, 6, 7, 8, 9, 10, 11], color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
    { key: "Afternoon", hours: [12, 13, 14, 15, 16], color: "#10b981", bg: "rgba(16,185,129,0.08)" },
    { key: "Evening", hours: [17, 18, 19, 20, 21, 22, 23], color: "#27a84e", bg: "rgba(39,168,78,0.08)" },
  ];
  
  const PERIODS = ALL_PERIODS.filter(p => {
    if (p.key === "Morning") return !disableMorning;
    if (p.key === "Afternoon") return !disableAfternoon;
    if (p.key === "Evening") return !disableEvening;
    if (p.key === "Late Night") return !disableLateNight;
    return true;
  });

  return (
    <section
      id="book"
      className="py-24 md:py-28 px-4 md:px-12 transition-colors duration-300"
      style={{ background: "linear-gradient(180deg,#0a1a0c 0%,#0d1f0f 100%)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="text-[10px] tracking-[0.18em] uppercase text-brand font-semibold mb-4">
            Live Availability
          </div>
          <h2
            className="font-display leading-none text-white"
            style={{ fontSize: "clamp(38px,5vw,58px)", letterSpacing: ".01em" }}
          >
            Book Your{" "}
            <em className="font-serif not-italic italic text-brand">Slot</em>
          </h2>
          <p className="mt-4 text-[14px] text-white/50 max-w-md mx-auto leading-relaxed">
            Select a date then pick your hour — slots blocked in real‑time.
          </p>

          {/* Sport Selector */}
          <div className="flex justify-center mt-6">
            <div className="inline-flex rounded-full p-1 gap-1 bg-white/5 border border-white/10 backdrop-blur-md">
              {(["Football", "Cricket"] as const).map((sport) => (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={`text-[13px] font-medium px-8 py-2.5 rounded-full border-none cursor-pointer tracking-[0.04em] transition-all duration-300 ${
                    selectedSport === sport
                      ? "bg-brand text-white shadow-lg shadow-brand/20 scale-[1.02]"
                      : "bg-transparent text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Calendar ─────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Month nav */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  disabled={isSameMonth(currentMonth, today)}
                  style={{ opacity: isSameMonth(currentMonth, today) ? 0.3 : 1 }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-display text-white tracking-widest uppercase text-sm">
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 px-4 pb-2">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-[10px] tracking-widest uppercase font-semibold py-1"
                    style={{ color: "rgba(255,255,255,0.30)" }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Date grid */}
              <div className="grid grid-cols-7 gap-1 px-4 pb-6">
                {calDays.map((day) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isPast = isBefore(day, today);
                  const isToday = isSameDay(day, today);
                  const isSelected = isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toISOString()}
                      disabled={isPast && !isToday}
                      onClick={() => {
                        if (!isPast || isToday) {
                          setSelectedDate(day);
                          if (!isSameMonth(day, currentMonth)) {
                            setCurrentMonth(startOfMonth(day));
                          }
                        }
                      }}
                      className="aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 relative"
                      style={{
                        opacity: !isCurrentMonth || (isPast && !isToday) ? 0.2 : 1,
                        cursor: isPast && !isToday ? "not-allowed" : "pointer",
                        background: isSelected
                          ? "linear-gradient(135deg,#27a84e,#1d7a38)"
                          : isToday && !isSelected
                          ? "rgba(39,168,78,0.15)"
                          : "transparent",
                        color: isSelected
                          ? "#fff"
                          : isToday
                          ? "#27a84e"
                          : "rgba(255,255,255,0.80)",
                        boxShadow: isSelected ? "0 4px 16px rgba(39,168,78,0.4)" : "none",
                        border: isToday && !isSelected ? "1px solid rgba(39,168,78,0.5)" : "1px solid transparent",
                        transform: isSelected ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>

              {/* Selected date chip */}
              <div
                className="mx-6 mb-6 px-4 py-3 rounded-2xl flex items-center justify-between"
                style={{ background: "rgba(39,168,78,0.12)", border: "1px solid rgba(39,168,78,0.25)" }}
              >
                <span className="text-[13px] text-white/60 font-medium">Selected date</span>
                <span className="text-[13px] font-bold text-brand">
                  {format(selectedDate, "EEE, d MMM yyyy")}
                </span>
              </div>
            </div>
          </div>

          {/* ── Slots panel ──────────────────────────────── */}
          <div className="lg:col-span-3">
            <div
              className="rounded-3xl h-full"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-brand" />
                  <h3 className="font-display text-white text-lg tracking-wider">
                    Available Slots — {format(selectedDate, "d MMM")}
                  </h3>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                    <span className="w-3 h-3 rounded-full bg-brand inline-block" /> Available
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: "rgba(255,255,255,0.1)" }} /> Booked
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto" style={{ maxHeight: "520px" }}>
                {isLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-brand border-t-transparent animate-spin"
                    />
                  </div>
                ) : allSlots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-white/40">
                    <Clock size={40} className="mb-3 opacity-30" />
                    <p>Loading slots…</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {PERIODS.map((period) => {
                      const periodSlots = allSlots.filter((s) =>
                        period.hours.includes(parseInt(s.split(":")[0], 10))
                      );
                      if (periodSlots.length === 0) return null;
                      return (
                        <div key={period.key}>
                          {/* Period heading */}
                          <div className="flex items-center gap-2 mb-3">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: period.color }}
                            />
                            <span
                              className="text-[10px] tracking-[0.14em] uppercase font-semibold"
                              style={{ color: period.color }}
                            >
                              {period.key}
                            </span>
                            <span className="flex-1 h-px" style={{ background: `${period.color}20` }} />
                          </div>

                          {/* Slot cards */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {periodSlots.map((slot) => {
                              const isAvail = availableSlots.includes(slot);
                              const endSlot = `${(parseInt(slot.split(":")[0], 10) + 1).toString().padStart(2, "0")}:00`;
                              const price = getPriceForSlot(slot);

                              return (
                                <div
                                  key={slot}
                                  className="group relative rounded-2xl overflow-hidden transition-all duration-300"
                                  style={{
                                    background: isAvail
                                      ? period.bg
                                      : "rgba(255,255,255,0.03)",
                                    border: isAvail
                                      ? `1px solid ${period.color}35`
                                      : "1px solid rgba(255,255,255,0.05)",
                                    opacity: isAvail ? 1 : 0.4,
                                  }}
                                >
                                  <div className="px-3 pt-3 pb-2">
                                    <div
                                      className="font-display text-base leading-none"
                                      style={{ color: isAvail ? "#fff" : "rgba(255,255,255,0.4)" }}
                                    >
                                      {formatHour(slot)}
                                    </div>
                                    <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                                      to {formatHour(endSlot)}
                                    </div>
                                    <div
                                      className="text-[11px] font-semibold mt-1.5"
                                      style={{ color: isAvail ? period.color : "rgba(255,255,255,0.25)" }}
                                    >
                                      ₹{price}
                                    </div>
                                  </div>

                                  {/* Book Now — only on available slots */}
                                  {isAvail && (
                                    <button
                                      onClick={() => handleBookNow(slot)}
                                      className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold tracking-wide uppercase transition-all duration-200 group-hover:opacity-100"
                                      style={{
                                        background: `linear-gradient(135deg, ${period.color}dd, ${period.color})`,
                                        color: "#fff",
                                        borderTop: `1px solid ${period.color}30`,
                                      }}
                                    >
                                      <MessageCircle size={12} />
                                      Book Now
                                    </button>
                                  )}

                                  {/* Booked badge */}
                                  {!isAvail && (
                                    <div
                                      className="w-full py-2 text-center text-[10px] tracking-widest uppercase"
                                      style={{
                                        background: "rgba(255,255,255,0.03)",
                                        color: "rgba(255,255,255,0.25)",
                                        borderTop: "1px solid rgba(255,255,255,0.04)",
                                      }}
                                    >
                                      Booked
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
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
