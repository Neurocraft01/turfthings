"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  IndianRupee, 
  CalendarCheck, 
  MessageSquare 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    todayBookings: "0",
    monthlyRevenue: "₹0",
    collectedAmount: "₹0",
    remainingAmount: "₹0",
    activePlayers: "0",
    pendingInquiries: "0",
  });
  const [charts, setCharts] = useState<any>({
    bookingData: [],
    revenueData: [],
    sportsPopularity: [],
    paymentMethods: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setCharts(data.charts);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-foreground uppercase tracking-wider">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your turf operations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Today's Bookings", value: stats.todayBookings, icon: CalendarCheck, trend: "Live bookings today", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
          { title: "Expected Revenue", value: stats.monthlyRevenue, icon: IndianRupee, trend: `${stats.collectedAmount} collected / ${stats.remainingAmount} pending`, color: "text-brand", bg: "bg-green-50 border-green-200" },
          { title: "Active Players", value: stats.activePlayers, icon: Users, trend: "Unique customer names", color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
          { title: "Pending Inquiries", value: stats.pendingInquiries, icon: MessageSquare, trend: "Requires attention", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-card p-6 rounded-xl border border-card-border shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg border ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-semibold mb-1">{stat.title}</h3>
            <div className="font-display text-4xl text-foreground tracking-wider mb-2">{stat.value}</div>
            <p className="text-xs text-gray-500 mt-auto">{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Bookings Chart */}
        <div className="bg-card p-6 rounded-xl border border-card-border shadow-sm">
          <h2 className="font-display text-xl text-foreground uppercase tracking-wider mb-6">Weekly Bookings (Volume)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={charts.bookingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px' }}
                  itemStyle={{ color: '#059669' }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="bookings" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-card p-6 rounded-xl border border-card-border shadow-sm">
          <h2 className="font-display text-xl text-foreground uppercase tracking-wider mb-6">Monthly Revenue (Last 6 Months)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={charts.revenueData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis 
                  stroke="#6b7280" 
                  tick={{ fill: '#6b7280' }} 
                  axisLine={false} 
                  tickLine={false} 
                  domain={[0, (dataMax: number) => Math.max(dataMax || 0, 1000)]}
                  tickFormatter={(val) => {
                    const num = Number(val);
                    if (isNaN(num)) return "";
                    if (num >= 1000) return `₹${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
                    return `₹${num}`;
                  }} 
                />
                <Tooltip 
                  formatter={(value) => `₹${value}`}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" dot={{ r: 6, fill: '#ffffff', strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Secondary Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sports Popularity Pie Chart */}
        <div className="bg-card p-6 rounded-xl border border-card-border shadow-sm flex flex-col items-center">
          <h2 className="font-display text-xl text-foreground uppercase tracking-wider mb-2 w-full text-left">Sport Popularity</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={charts.sportsPopularity}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.sportsPopularity.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Pie Chart */}
        <div className="bg-card p-6 rounded-xl border border-card-border shadow-sm flex flex-col items-center">
          <h2 className="font-display text-xl text-foreground uppercase tracking-wider mb-2 w-full text-left">Payment Statuses</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={charts.paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={90}
                  dataKey="value"
                >
                  {charts.paymentMethods.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
