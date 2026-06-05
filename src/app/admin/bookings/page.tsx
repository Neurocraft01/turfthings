"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Clock,
  CalendarCheck,
  X,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Calendar as CalendarIcon,
  Phone,
  User,
  IndianRupee,
  Dumbbell,
  ChevronRight,
  Timer,
  Loader2,
} from "lucide-react";

type BookingStatus = "confirmed" | "pending" | "cancelled";

interface Booking {
  id: string;
  playerName: string;
  mobileNumber: string;
  bookingDate: string;
  slotStart: string;
  slotEnd: string;
  totalSlots: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  bookingStatus: BookingStatus;
  messageStatus: string | null;
  sport?: string;
}

/* ─── Rate Schedule (matches home page defaults) ─── */
const RATE_SCHEDULE = [
  { period: "Morning",    startH: 5,  endH: 12, pricePerHour: 600  },
  { period: "Afternoon",  startH: 12, endH: 17, pricePerHour: 400  },
  { period: "Evening",    startH: 17, endH: 24, pricePerHour: 800  },
  { period: "Late Night", startH: 0,  endH: 5,  pricePerHour: 1000 },
];

function getPriceForHour(hour: number) {
  for (const r of RATE_SCHEDULE) {
    if (hour >= r.startH && hour < r.endH) return r.pricePerHour;
  }
  return 600;
}

function calcAutoPrice(startTime: string, totalSlots: number): number {
  const [h] = startTime.split(":").map(Number);
  const pricePerHour = getPriceForHour(h);
  const hours = (totalSlots * 30) / 60;
  return Math.round(pricePerHour * hours);
}

function formatTime12h(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function addMinutes(time24: string, mins: number) {
  const [h, m] = time24.split(":").map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${nh.toString().padStart(2, "0")}:${nm.toString().padStart(2, "0")}`;
}

function generateTimeOptions() {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) {
    opts.push(`${h.toString().padStart(2, "0")}:00`);
    opts.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return opts;
}

const TIME_OPTIONS = generateTimeOptions();

const DURATION_OPTIONS = [
  { slots: 2,  label: "1 Hour" },
  { slots: 3,  label: "1.5 Hours" },
  { slots: 4,  label: "2 Hours" },
  { slots: 6,  label: "3 Hours" },
  { slots: 8,  label: "4 Hours" },
  { slots: 12, label: "6 Hours" },
];

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: BookingStatus }) {
  switch (status) {
    case "confirmed":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-700 border border-green-500/20">
          <CheckCircle size={11} className="mr-1" /> Confirmed
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-700 border border-yellow-500/20">
          <Clock size={11} className="mr-1" /> Pending
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-700 border border-red-500/20">
          <XCircle size={11} className="mr-1" /> Cancelled
        </span>
      );
  }
}

/* ─── New Booking Modal ─── */
function NewBookingModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [playerName, setPlayerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [sport, setSport] = useState<"Football" | "Cricket">("Football");
  const [bookingDate, setBookingDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [slotStart, setSlotStart] = useState("18:00");
  const [totalSlots, setTotalSlots] = useState(4); // 2 hours default
  const [paidAmount, setPaidAmount] = useState(0);
  const [autoPrice, setAutoPrice] = useState(true);
  const [manualTotal, setManualTotal] = useState(0);

  const slotEnd = addMinutes(slotStart, totalSlots * 30);
  const durationMins = totalSlots * 30;
  const computedTotal = calcAutoPrice(slotStart, totalSlots);
  const totalAmount = autoPrice ? computedTotal : manualTotal;
  const remaining = Math.max(0, totalAmount - paidAmount);

  // Sync paidAmount when total changes
  useEffect(() => {
    if (autoPrice) setManualTotal(computedTotal);
  }, [computedTotal, autoPrice]);

  const getPeriodLabel = () => {
    const [h] = slotStart.split(":").map(Number);
    for (const r of RATE_SCHEDULE) {
      if (h >= r.startH && h < r.endH)
        return `${r.period} slot — ₹${r.pricePerHour}/hr`;
    }
    return "";
  };

  const handleSubmit = async () => {
    if (!playerName || !mobileNumber) {
      setError("Player name and mobile number are required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName,
          mobileNumber,
          sport,
          bookingDate,
          slotStart,
          slotEnd,
          totalSlots,
          totalAmount,
          paidAmount,
          bookingStatus: "confirmed",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to create booking. Check if the slot is already taken.");
        setSubmitting(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a1a0c] to-[#1a3a1c] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-display text-xl uppercase tracking-wider">New Booking</h2>
            <p className="text-white/50 text-xs mt-0.5">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-gray-100">
          {[
            { n: 1, label: "Player", icon: User },
            { n: 2, label: "Slot",   icon: CalendarIcon },
            { n: 3, label: "Payment", icon: IndianRupee },
          ].map(({ n, label, icon: Icon }) => (
            <button
              key={n}
              onClick={() => step > n && setStep(n as 1 | 2 | 3)}
              className={`flex-1 flex flex-col items-center py-3.5 gap-1 text-xs font-medium transition-colors border-b-2 ${
                step === n
                  ? "border-brand text-brand"
                  : step > n
                  ? "border-green-400 text-green-600 cursor-pointer"
                  : "border-transparent text-gray-300 cursor-default"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ─── Step 1: Player Details ─── */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Player Name *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Used for WhatsApp confirmation messages</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Sport
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["Football", "Cricket"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSport(s)}
                      className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        sport === s
                          ? "border-brand bg-brand/5 text-brand"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {s === "Football" ? "⚽ Football" : "🏏 Cricket"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 2: Slot & Timing ─── */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Booking Date
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  min={format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Start Time
                  </label>
                  <select
                    value={slotStart}
                    onChange={(e) => setSlotStart(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand bg-white"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {formatTime12h(t)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Duration
                  </label>
                  <select
                    value={totalSlots}
                    onChange={(e) => setTotalSlots(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand bg-white"
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d.slots} value={d.slots}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Slot Visualizer */}
              <div className="bg-gradient-to-br from-[#0a1a0c]/5 to-[#0a1a0c]/10 rounded-2xl p-4 border border-[#0a1a0c]/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-display text-[#0a1a0c] tracking-tight">
                      {formatTime12h(slotStart)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Start</div>
                  </div>
                  <div className="flex-1 mx-4 flex flex-col items-center gap-1">
                    <div className="w-full h-0.5 bg-brand relative rounded-full">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        {durationMins} min
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-display text-[#0a1a0c] tracking-tight">
                      {formatTime12h(slotEnd)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">End</div>
                  </div>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs text-brand font-semibold bg-brand/10 px-3 py-1 rounded-full">
                    <Timer size={11} />
                    {getPeriodLabel()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 3: Payment ─── */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Summary card */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Player</span>
                  <span className="font-semibold text-gray-900">{playerName}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Slot</span>
                  <span className="font-semibold text-gray-900">
                    {formatTime12h(slotStart)} → {formatTime12h(slotEnd)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Date</span>
                  <span className="font-semibold text-gray-900">{bookingDate}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Sport</span>
                  <span className="font-semibold text-gray-900">{sport}</span>
                </div>
              </div>

              {/* Total Amount */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Amount (₹)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoPrice}
                      onChange={(e) => setAutoPrice(e.target.checked)}
                      className="accent-brand"
                    />
                    Auto-calculate
                  </label>
                </div>
                {autoPrice ? (
                  <div className="w-full border border-brand/30 bg-brand/5 rounded-xl px-4 py-3 text-sm font-bold text-brand flex items-center justify-between">
                    <span>₹{totalAmount.toLocaleString()}</span>
                    <span className="text-xs font-normal text-brand/70">{getPeriodLabel()}</span>
                  </div>
                ) : (
                  <div className="relative">
                    <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={manualTotal}
                      onChange={(e) => setManualTotal(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
                    />
                  </div>
                )}
              </div>

              {/* Paid Amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Advance / Paid Amount (₹)
                </label>
                <div className="relative">
                  <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min={0}
                    max={totalAmount}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
                  />
                </div>
              </div>

              {/* Balance summary */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Total</div>
                  <div className="text-lg font-display text-gray-900">₹{totalAmount.toLocaleString()}</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <div className="text-xs text-green-600 mb-1">Paid</div>
                  <div className="text-lg font-display text-green-700">₹{paidAmount.toLocaleString()}</div>
                </div>
                <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                  <div className="text-xs text-red-500 mb-1">Balance</div>
                  <div className="text-lg font-display text-red-600">₹{remaining.toLocaleString()}</div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-200">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-5">
          <button
            onClick={() => (step > 1 ? setStep((s) => (s - 1) as 1 | 2 | 3) : onClose())}
            className="px-4 py-2.5 rounded-xl text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && (!playerName || !mobileNumber)) {
                  setError("Please fill in player name and mobile number.");
                  return;
                }
                setError("");
                setStep((s) => (s + 1) as 2 | 3);
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm"
            >
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <CheckCircle size={15} />
              )}
              Confirm Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Extend Booking Modal ─── */
function ExtendModal({
  booking,
  onClose,
  onSuccess,
}: {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [extendSlots, setExtendSlots] = useState(2);
  const [additionalAmount, setAdditionalAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const newEndTime = addMinutes(booking.slotEnd, extendSlots * 30);
  const suggestedPrice = calcAutoPrice(booking.slotEnd, extendSlots);

  useEffect(() => {
    setAdditionalAmount(suggestedPrice);
  }, [suggestedPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extendSlots, additionalAmount, paidAmount: booking.paidAmount }),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to extend booking");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-white font-display text-lg uppercase tracking-wider">Extend Session</h2>
            <p className="text-blue-200 text-xs mt-0.5">{booking.playerName}</p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-600 font-semibold mb-1">Current end time</div>
              <div className="text-2xl font-display text-blue-900">{formatTime12h(booking.slotEnd)}</div>
            </div>
            <ChevronRight size={20} className="text-blue-300" />
            <div>
              <div className="text-xs text-brand font-semibold mb-1">New end time</div>
              <div className="text-2xl font-display text-brand">{formatTime12h(newEndTime)}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Extra Duration
            </label>
            <select
              value={extendSlots}
              onChange={(e) => setExtendSlots(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand bg-white"
            >
              {[1, 2, 3, 4, 6].map((s) => (
                <option key={s} value={s}>
                  + {s * 30} min ({s * 30 >= 60 ? `${s / 2} hr` : "30 min"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Additional Charges (₹){" "}
              <span className="text-brand font-normal">(suggested: ₹{suggestedPrice})</span>
            </label>
            <input
              type="number"
              value={additionalAmount}
              onChange={(e) => setAdditionalAmount(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
              Extend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════ */
export default function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [dateFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?date=${dateFilter}`);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      console.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: BookingStatus) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingStatus: status }),
      });
      fetchBookings();
    } catch {
      console.error("Failed to update status");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      b.playerName.toLowerCase().includes(q) ||
      b.mobileNumber.includes(q) ||
      b.id.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || b.bookingStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalBookings = filteredBookings.length;
  const totalRevenue = filteredBookings.reduce(
    (sum, b) => sum + (b.bookingStatus !== "cancelled" ? b.totalAmount : 0),
    0
  );
  const totalCollected = filteredBookings.reduce(
    (sum, b) => sum + (b.bookingStatus !== "cancelled" ? b.paidAmount : 0),
    0
  );

  return (
    <div className="animate-in fade-in duration-500">
      {isNewModalOpen && (
        <NewBookingModal
          onClose={() => setIsNewModalOpen(false)}
          onSuccess={fetchBookings}
        />
      )}
      {isExtendModalOpen && selectedBooking && (
        <ExtendModal
          booking={selectedBooking}
          onClose={() => setIsExtendModalOpen(false)}
          onSuccess={fetchBookings}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-4xl text-foreground uppercase tracking-wider">Bookings</h1>
          <p className="text-gray-500 mt-1">Manage all turf reservations</p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="bg-brand hover:bg-brand-hover text-white font-bold py-2.5 px-5 rounded-xl uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Booking
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Bookings", value: totalBookings, icon: Users, color: "blue" },
          { label: "Expected Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "green" },
          { label: "Collected Amount", value: `₹${totalCollected.toLocaleString()}`, icon: CheckCircle, color: "brand" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-card-border p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color === "blue" ? "bg-blue-50 text-blue-600" : color === "green" ? "bg-green-50 text-green-600" : "bg-brand/10 text-brand"}`}>
              <Icon size={22} />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{label}</div>
              <div className="text-2xl font-display text-foreground">{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-card-border overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-card-border flex flex-col sm:flex-row gap-3 bg-gray-50/50">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-card-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-brand"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-white border border-card-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-brand"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "all")}
              className="bg-white border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand"
            >
              <option value="all">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-card-border">
              <tr>
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4">Timing</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Financials</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Loader2 size={28} className="animate-spin mx-auto text-brand/40" />
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{booking.playerName}</span>
                        <span
                          className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                            booking.sport === "Cricket"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {booking.sport || "Football"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone size={10} /> {booking.mobileNumber}
                      </div>
                      <div className="text-[10px] text-gray-300 mt-0.5 font-mono">
                        #{booking.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground text-sm">
                        {formatTime12h(booking.slotStart)} – {formatTime12h(booking.slotEnd)}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {booking.totalSlots * 30} min · {booking.totalSlots} slot{booking.totalSlots !== 1 ? "s" : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="mb-1.5">
                        <StatusBadge status={booking.bookingStatus} />
                      </div>
                      {booking.messageStatus === "sent" && (
                        <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          WA ✓
                        </span>
                      )}
                      {booking.messageStatus === "failed" && (
                        <span className="text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded">
                          WA ✗
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs space-y-1">
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-400">Total</span>
                        <span className="font-bold text-foreground">₹{booking.totalAmount}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-400">Paid</span>
                        <span className="font-semibold text-green-600">₹{booking.paidAmount}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-400">Balance</span>
                        <span className="font-semibold text-red-500">₹{booking.remainingAmount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        {booking.bookingStatus === "pending" && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                            className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsExtendModalOpen(true);
                          }}
                          disabled={booking.bookingStatus === "cancelled"}
                          className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40"
                        >
                          Extend
                        </button>
                        {booking.bookingStatus !== "cancelled" && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!loading && filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center text-gray-300">
                      <CalendarCheck size={52} className="mb-4 opacity-30" />
                      <p className="text-gray-400 font-medium">No bookings found for this date.</p>
                      <p className="text-gray-300 text-sm mt-1">Try changing the date or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
