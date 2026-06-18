"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Loader2,
  Calendar,
  User,
  Phone,
  Clock,
  CreditCard,
  Smartphone,
  MessageSquare,
  IndianRupee,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hash,
  Dumbbell,
} from "lucide-react";
import { format, parseISO } from "date-fns";

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
  firstPaidAmount: number;
  firstPaymentMethod: string;
  secondPaidAmount: number;
  secondPaymentMethod: string;
  bookingStatus: string;
  sport: string;
  paymentMethod: string;
  whatsappNumber?: string;
  messageStatus?: string;
  createdAt: string;
  updatedAt: string;
}

const PAGE_SIZE = 10;

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  pending:   { label: "Pending",   color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-600 border-red-200", icon: XCircle },
};

const msgStatusConfig: Record<string, { label: string; color: string }> = {
  sent:    { label: "Sent",    color: "text-green-600" },
  failed:  { label: "Failed",  color: "text-red-500" },
  pending: { label: "Pending", color: "text-yellow-600" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: "bg-gray-100 text-gray-600 border-gray-200", icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  try { return format(parseISO(dateStr), "dd MMM yyyy"); } catch { return dateStr; }
}

function formatDateTime(dateStr: string) {
  try { return format(parseISO(dateStr), "dd MMM yyyy, hh:mm a"); } catch { return dateStr; }
}

export default function BookingSearchPage() {
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("all");
  const [sportFilter, setSport]     = useState("all");
  const [dateFilter, setDate]       = useState("");
  const [page, setPage]             = useState(1);
  const [expanded, setExpanded]     = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)     params.set("search", search);
      if (dateFilter) params.set("date", dateFilter);
      const res = await fetch(`/api/bookings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setPage(1);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [search, dateFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchBookings(), 400);
    return () => clearTimeout(timer);
  }, [fetchBookings]);

  // Client-side filter for status & sport (API already handles search & date)
  const filtered = bookings.filter((b) => {
    if (statusFilter !== "all" && b.bookingStatus !== statusFilter) return false;
    if (sportFilter  !== "all" && b.sport.toLowerCase() !== sportFilter.toLowerCase()) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const sports = [...new Set(bookings.map((b) => b.sport))].sort();

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setSport("all");
    setDate("");
  };

  const hasFilters = search || statusFilter !== "all" || sportFilter !== "all" || dateFilter;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display uppercase tracking-wider text-foreground">
          Booking Search &amp; Details
        </h2>
        <span className="text-sm text-gray-400">
          {filtered.length} booking{filtered.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* ── Filter Bar ───────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Text search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, mobile, ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        {/* Date picker */}
        <div className="relative">
          <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDate(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand transition-colors bg-white"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Sport filter */}
        <select
          value={sportFilter}
          onChange={(e) => { setSport(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand bg-white"
        >
          <option value="all">All Sports</option>
          {sports.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-red-200 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 size={32} className="animate-spin text-brand/40" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[260px] gap-3 text-gray-400">
          <Filter size={40} className="opacity-30" />
          <p className="text-sm font-medium">No bookings match your filters</p>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-brand underline">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Slot</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sport</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((b) => (
                  <React.Fragment key={b.id}>
                    <tr
                      key={b.id}
                      className={`hover:bg-gray-50/60 transition-colors cursor-pointer ${expanded === b.id ? "bg-brand/5" : ""}`}
                      onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.id.slice(0, 12)}…</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{b.playerName}</p>
                        <p className="text-xs text-gray-400">{b.mobileNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(b.bookingDate)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium text-foreground">{b.slotStart}</span>
                        <span className="text-gray-400 mx-1">–</span>
                        <span className="font-medium text-foreground">{b.slotEnd}</span>
                        <p className="text-xs text-gray-400">{b.totalSlots} slot{b.totalSlots !== 1 ? "s" : ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                          {b.sport}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">₹{b.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="text-green-700 font-semibold">₹{b.paidAmount.toLocaleString()}</span>
                        {b.remainingAmount > 0 && (
                          <p className="text-xs text-red-400">Due: ₹{b.remainingAmount.toLocaleString()}</p>
                        )}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={b.bookingStatus} /></td>
                      <td className="px-4 py-3">
                        <button
                          className="text-xs text-brand font-semibold hover:underline"
                          onClick={(e) => { e.stopPropagation(); setExpanded(expanded === b.id ? null : b.id); }}
                        >
                          {expanded === b.id ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>

                    {/* ── Expanded detail row ── */}
                    {expanded === b.id && (
                      <tr key={`${b.id}-detail`} className="bg-brand/5">
                        <td colSpan={9} className="px-4 pb-5 pt-0">
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5 bg-white border border-brand/20 rounded-xl">

                            {/* Booking Identity */}
                            <DetailBlock icon={Hash} label="Booking ID" value={b.id} mono />
                            <DetailBlock icon={Calendar} label="Booking Date" value={formatDate(b.bookingDate)} />
                            <DetailBlock icon={Clock} label="Time Slot" value={`${b.slotStart} – ${b.slotEnd} (${b.totalSlots} slot${b.totalSlots !== 1 ? "s" : ""})`} />

                            {/* Player */}
                            <DetailBlock icon={User} label="Player Name" value={b.playerName} />
                            <DetailBlock icon={Phone} label="Mobile Number" value={b.mobileNumber} />
                            <DetailBlock icon={Smartphone} label="WhatsApp Number" value={b.whatsappNumber || "—"} />

                            {/* Sport & Status */}
                            <DetailBlock icon={Dumbbell} label="Sport" value={b.sport} />
                            <div className="flex flex-col gap-1">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Booking Status</p>
                              <StatusBadge status={b.bookingStatus} />
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">WhatsApp Message</p>
                              {b.messageStatus ? (
                                <span className={`text-sm font-semibold ${msgStatusConfig[b.messageStatus]?.color ?? "text-gray-600"}`}>
                                  {msgStatusConfig[b.messageStatus]?.label ?? b.messageStatus}
                                </span>
                              ) : <span className="text-sm text-gray-400">—</span>}
                            </div>

                            {/* Payments */}
                            <DetailBlock icon={IndianRupee} label="Total Amount" value={`₹${b.totalAmount.toLocaleString()}`} />
                            <DetailBlock icon={IndianRupee} label="Paid Amount" value={`₹${b.paidAmount.toLocaleString()}`} />
                            <DetailBlock icon={IndianRupee} label="Remaining Amount" value={`₹${b.remainingAmount.toLocaleString()}`} valueClass={b.remainingAmount > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"} />

                            {/* Payment breakdown */}
                            <div className="flex flex-col gap-1">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <CreditCard size={12} /> 1st Payment
                              </p>
                              <p className="text-sm font-semibold text-foreground">₹{b.firstPaidAmount.toLocaleString()}</p>
                              <p className="text-xs text-gray-400">{b.firstPaymentMethod}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <CreditCard size={12} /> 2nd Payment
                              </p>
                              <p className="text-sm font-semibold text-foreground">₹{b.secondPaidAmount.toLocaleString()}</p>
                              <p className="text-xs text-gray-400">{b.secondPaymentMethod}</p>
                            </div>
                            <DetailBlock icon={CreditCard} label="Payment Method" value={b.paymentMethod} />

                            {/* Timestamps */}
                            <DetailBlock icon={Calendar} label="Created At" value={formatDateTime(b.createdAt)} />
                            <DetailBlock icon={Calendar} label="Last Updated" value={formatDateTime(b.updatedAt)} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ──────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => Math.abs(n - page) <= 2)
                  .map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                        n === page ? "bg-brand text-white" : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Reusable detail cell ──────────────────────────────
function DetailBlock({
  icon: Icon,
  label,
  value,
  mono = false,
  valueClass = "",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
        <Icon size={12} /> {label}
      </p>
      <p className={`text-sm font-semibold text-foreground break-all ${mono ? "font-mono text-xs" : ""} ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}
