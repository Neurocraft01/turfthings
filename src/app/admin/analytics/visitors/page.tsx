"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const visitorData = [
  { time: '06:00', visitors: 10 },
  { time: '09:00', visitors: 15 },
  { time: '12:00', visitors: 5 },
  { time: '15:00', visitors: 20 },
  { time: '18:00', visitors: 45 },
  { time: '21:00', visitors: 35 },
  { time: '23:00', visitors: 15 },
];

export default function VisitorsAnalytics() {
  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-xl font-display uppercase tracking-wider text-foreground mb-6">Visitor Traffic Analysis</h2>
      
      <div className="h-80 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={visitorData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="time" stroke="#6b7280" axisLine={false} tickLine={false} />
            <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Area type="monotone" dataKey="visitors" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 border border-card-border rounded-xl bg-gray-50/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Peak Hours</p>
            <p className="text-2xl font-bold text-foreground mt-1">18:00 - 21:00</p>
          </div>
          <div className="text-brand font-bold text-xl bg-brand/10 p-3 rounded-lg">
            High
          </div>
        </div>
        <div className="p-5 border border-card-border rounded-xl bg-gray-50/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Total Unique Players (Monthly)</p>
            <p className="text-2xl font-bold text-foreground mt-1">1,248</p>
          </div>
          <div className="text-accent font-bold text-xl bg-accent/10 p-3 rounded-lg">
            +12%
          </div>
        </div>
      </div>
    </div>
  );
}
