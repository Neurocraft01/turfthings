"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const bookingData = [
  { name: 'Mon', bookings: 12, football: 8, boxCricket: 4, kabaddi: 0 },
  { name: 'Tue', bookings: 19, football: 10, boxCricket: 9, kabaddi: 0 },
  { name: 'Wed', bookings: 15, football: 11, boxCricket: 4, kabaddi: 0 },
  { name: 'Thu', bookings: 22, football: 12, boxCricket: 8, kabaddi: 2 },
  { name: 'Fri', bookings: 30, football: 15, boxCricket: 12, kabaddi: 3 },
  { name: 'Sat', bookings: 45, football: 20, boxCricket: 20, kabaddi: 5 },
  { name: 'Sun', bookings: 40, football: 15, boxCricket: 22, kabaddi: 3 },
];

export default function BookingAnalytics() {
  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-xl font-display uppercase tracking-wider text-foreground mb-6">Booking Volume (Weekly)</h2>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bookingData} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} />
            <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="football" stackId="a" fill="#059669" name="Football" />
            <Bar dataKey="boxCricket" stackId="a" fill="#D97706" name="Box Cricket" />
            <Bar dataKey="kabaddi" stackId="a" fill="#3b82f6" name="Kabaddi" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-card-border rounded-lg bg-gray-50/50">
          <p className="text-sm text-gray-500">Total Bookings (This Week)</p>
          <p className="text-3xl font-bold text-foreground mt-1">183</p>
        </div>
        <div className="p-4 border border-card-border rounded-lg bg-gray-50/50">
          <p className="text-sm text-gray-500">Most Popular Sport</p>
          <p className="text-3xl font-bold text-brand mt-1">Football</p>
        </div>
        <div className="p-4 border border-card-border rounded-lg bg-gray-50/50">
          <p className="text-sm text-gray-500">Peak Day</p>
          <p className="text-3xl font-bold text-accent mt-1">Saturday</p>
        </div>
      </div>
    </div>
  );
}
