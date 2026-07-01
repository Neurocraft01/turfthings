"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Loader2 } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";

interface Booking {
  id: string;
  bookingDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  bookingStatus: string;
}

export default function PaymentAnalytics() {
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
        console.error("Failed to fetch payment analytics:", e);
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

  const active = bookings.filter((b) => b.bookingStatus !== "cancelled");
  const totalExpected  = active.reduce((s, b) => s + b.totalAmount, 0);
  const totalCollected = active.reduce((s, b) => s + b.paidAmount, 0);
  const outstanding    = active.reduce((s, b) => s + b.remainingAmount, 0);

  const fullyPaid  = active.filter((b) => b.remainingAmount === 0).length;
  const partial    = active.filter((b) => b.paidAmount > 0 && b.remainingAmount > 0).length;
  const unpaid     = active.filter((b) => b.paidAmount === 0).length;

  const distributionData = [
    { name: "Fully Paid",     value: active.filter((b) => b.remainingAmount === 0).reduce((s, b) => s + b.paidAmount, 0),  color: "#059669" },
    { name: "Partial",        value: active.filter((b) => b.paidAmount > 0 && b.remainingAmount > 0).reduce((s, b) => s + b.paidAmount, 0), color: "#D97706" },
    { name: "Outstanding",    value: outstanding, color: "#EF4444" },
  ].filter((d) => d.value > 0);

  /* Last 14 days revenue trend */
  const revenueTrend = Array.from({ length: 14 }, (_, i) => {
    const date     = format(subDays(new Date(), 13 - i), "yyyy-MM-dd");
    const dayLabel = format(subDays(new Date(), 13 - i), "dd MMM");
    const day      = active.filter((b) => b.bookingDate === date);
    return {
      name:      dayLabel,
      collected: day.reduce((s, b) => s + b.paidAmount, 0),
      expected:  day.reduce((s, b) => s + b.totalAmount, 0),
    };
  });

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <h2 className="text-xl font-display uppercase tracking-wider text-foreground">
        Payment Analytics
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 border border-card-border rounded-xl bg-green-50 border-l-4 border-l-green-500">
          <p className="text-sm text-green-800 font-medium mb-1">Total Expected Revenue</p>
          <p className="text-4xl font-bold text-green-700">₹{totalExpected.toLocaleString("en-IN")}</p>
          <p className="text-xs text-green-600 mt-1">{active.length} active bookings</p>
        </div>
        <div className="p-6 border border-card-border rounded-xl bg-blue-50 border-l-4 border-l-blue-500">
          <p className="text-sm text-blue-800 font-medium mb-1">Total Collected</p>
          <p className="text-4xl font-bold text-blue-700">₹{totalCollected.toLocaleString("en-IN")}</p>
          <p className="text-xs text-blue-600 mt-1">{fullyPaid} fully paid, {partial} partial</p>
        </div>
        <div className="p-6 border border-card-border rounded-xl bg-red-50 border-l-4 border-l-red-500">
          <p className="text-sm text-red-800 font-medium mb-1">Outstanding Balance</p>
          <p className="text-4xl font-bold text-red-700">₹{outstanding.toLocaleString("en-IN")}</p>
          <p className="text-xs text-red-600 mt-1">{unpaid} unpaid, {partial} partial</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="border border-card-border rounded-xl p-5 bg-gray-50/30">
          <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">
            Revenue Distribution
          </h3>
          {distributionData.length === 0 ? (
            <div className="flex items-center justify-center h-60 text-gray-400 text-sm">No payment data yet</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Payment status breakdown */}
        <div className="border border-card-border rounded-xl p-5 bg-gray-50/30 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">
            Payment Status Breakdown
          </h3>
          <div className="space-y-4">
            {[
              { label: "Fully Paid",  count: fullyPaid, pct: active.length ? Math.round((fullyPaid / active.length) * 100) : 0,  bg: "bg-green-500",  text: "text-green-700"  },
              { label: "Partial",     count: partial,   pct: active.length ? Math.round((partial   / active.length) * 100) : 0,  bg: "bg-yellow-500", text: "text-yellow-700" },
              { label: "Unpaid",      count: unpaid,    pct: active.length ? Math.round((unpaid    / active.length) * 100) : 0,  bg: "bg-red-500",    text: "text-red-700"   },
            ].map(({ label, count, pct, bg, text }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className={`font-semibold ${text}`}>{label}</span>
                  <span className="text-gray-500">{count} bookings ({pct}%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
                  <div className={`h-full rounded-full ${bg} transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-500">Collect Rate</p>
              <p className="text-xl font-bold text-foreground">
                {totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-500">Avg Booking</p>
              <p className="text-xl font-bold text-foreground">
                ₹{active.length > 0 ? Math.round(totalExpected / active.length).toLocaleString("en-IN") : 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-500">Avg Paid</p>
              <p className="text-xl font-bold text-brand">
                ₹{active.length > 0 ? Math.round(totalCollected / active.length).toLocaleString("en-IN") : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 14-day revenue trend */}
      <div className="border border-card-border rounded-xl p-5 bg-gray-50/30">
        <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">
          Last 14 Days — Revenue Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={revenueTrend} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis stroke="#6b7280" axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                formatter={(v: any, name: any) => [`₹${Number(v).toLocaleString("en-IN")}`, name]}
              />
              <Legend />
              <Line type="monotone" dataKey="expected"  stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Expected" />
              <Line type="monotone" dataKey="collected" stroke="#27a84e" strokeWidth={2} dot={{ fill: "#27a84e", r: 3 }} name="Collected" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
