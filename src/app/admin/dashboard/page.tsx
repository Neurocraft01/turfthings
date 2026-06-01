"use client";

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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const bookingData = [
  { name: 'Mon', bookings: 12 },
  { name: 'Tue', bookings: 19 },
  { name: 'Wed', bookings: 15 },
  { name: 'Thu', bookings: 22 },
  { name: 'Fri', bookings: 45 },
  { name: 'Sat', bookings: 85 },
  { name: 'Sun', bookings: 75 },
];

const revenueData = [
  { name: 'Week 1', revenue: 45000 },
  { name: 'Week 2', revenue: 52000 },
  { name: 'Week 3', revenue: 48000 },
  { name: 'Week 4', revenue: 71000 },
];

const sportsPopularity = [
  { name: 'Box Cricket', value: 65, color: '#059669' },
  { name: 'Football (5v5)', value: 25, color: '#D97706' },
  { name: 'Kabaddi', value: 10, color: '#3b82f6' }
];

const paymentMethods = [
  { name: 'UPI / PhonePe', value: 60, color: '#0ea5e9' },
  { name: 'Cash', value: 30, color: '#f59e0b' },
  { name: 'Pending', value: 10, color: '#ef4444' }
];

export default function Dashboard() {
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
          { title: "Today's Bookings", value: "32", icon: CalendarCheck, trend: "+15% from yesterday", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
          { title: "Monthly Revenue", value: "₹2,16,000", icon: IndianRupee, trend: "+12% from last month", color: "text-brand", bg: "bg-green-50 border-green-200" },
          { title: "Active Players", value: "2,420", icon: Users, trend: "+45 new this week", color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
          { title: "Pending Inquiries", value: "14", icon: MessageSquare, trend: "Requires attention", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" }
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          <h2 className="font-display text-xl text-foreground uppercase tracking-wider mb-6">Revenue Trend (Monthly)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  formatter={(value) => `₹${value}`}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#ffffff', strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sportsPopularity}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sportsPopularity.map((entry, index) => (
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
          <h2 className="font-display text-xl text-foreground uppercase tracking-wider mb-2 w-full text-left">Payment Methods</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={90}
                  dataKey="value"
                >
                  {paymentMethods.map((entry, index) => (
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
