"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import { Loader2 } from "lucide-react";
import { format, subDays, startOfWeek, parseISO } from "date-fns";

interface Booking {
  id: string;
  playerName: string;
  bookingDate: string;
  sport?: string;
  bookingStatus: string;
  totalAmount: number;
  paidAmount: number;
}

export default function BookingAnalytics() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch("/api/bookings");
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch (e) {
        console.error("Failed to fetch bookings for analytics:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-brand/40" />
      </div>
    );
  }

  /* ── Build last-7-days chart data ── */
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const dayLabel = format(subDays(new Date(), 6 - i), "EEE");
    const dayBookings = bookings.filter((b) => b.bookingDate === date && b.bookingStatus !== "cancelled");
    const football = dayBookings.filter((b) => (b.sport || "Football") === "Football").length;
    const cricket  = dayBookings.filter((b) => b.sport === "Cricket").length;
    return { name: dayLabel, date, bookings: dayBookings.length, football, cricket };
  });

  /* ── Summary stats ── */
  const activeBookings = bookings.filter((b) => b.bookingStatus !== "cancelled");
  const totalBookings  = activeBookings.length;
  const footballCount  = activeBookings.filter((b) => (b.sport || "Football") === "Football").length;
  const cricketCount   = activeBookings.filter((b) => b.sport === "Cricket").length;
  const mostPopular    = footballCount >= cricketCount ? "Football" : "Cricket";

  // Peak day across all bookings
  const dayCount: Record<string, number> = {};
  activeBookings.forEach((b) => {
    const d = format(parseISO(b.bookingDate), "EEEE");
    dayCount[d] = (dayCount[d] || 0) + 1;
  });
  const peakDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  /* ── Monthly trend (last 6 months) ── */
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthKey = format(d, "yyyy-MM");
    const label = format(d, "MMM");
    const monthBookings = activeBookings.filter((b) => b.bookingDate.startsWith(monthKey));
    return {
      name: label,
      bookings: monthBookings.length,
      revenue: monthBookings.reduce((s, b) => s + b.totalAmount, 0),
    };
  });

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <h2 className="text-xl font-display uppercase tracking-wider text-foreground">
        Booking Analytics
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings", value: totalBookings, color: "text-foreground" },
          { label: "Football Bookings", value: footballCount, color: "text-blue-600" },
          { label: "Cricket Bookings", value: cricketCount, color: "text-emerald-600" },
          { label: "Peak Day", value: peakDay, color: "text-brand" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-5 border border-card-border rounded-xl bg-gray-50/50">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Last 7 Days Bar Chart */}
      <div className="border border-card-border rounded-xl p-5 bg-gray-50/30">
        <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">
          Last 7 Days — Bookings by Sport
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} />
              <YAxis stroke="#6b7280" axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <Legend />
              <Bar dataKey="football" stackId="a" fill="#3b82f6" name="Football" />
              <Bar dataKey="cricket"  stackId="a" fill="#059669" name="Cricket" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="border border-card-border rounded-xl p-5 bg-gray-50/30">
        <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">
          Monthly Booking Trend (Last 6 Months)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} />
              <YAxis stroke="#6b7280" axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb", borderRadius: "8px" }}
              />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#27a84e" strokeWidth={2} dot={{ fill: "#27a84e", r: 4 }} name="Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sport Breakdown */}
      <div className="border border-card-border rounded-xl p-5 bg-gray-50/30">
        <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">
          Sport Distribution
        </h3>
        <div className="flex flex-col gap-4">
          {[
            { sport: "Football", count: footballCount, color: "#3b82f6", bg: "bg-blue-500" },
            { sport: "Cricket",  count: cricketCount,  color: "#059669", bg: "bg-emerald-500" },
          ].map(({ sport, count, bg }) => {
            const pct = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;
            return (
              <div key={sport}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-foreground">{sport}</span>
                  <span className="text-gray-500">{count} bookings ({pct}%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${bg} transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
