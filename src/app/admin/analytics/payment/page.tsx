"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const paymentMethods = [
  { name: 'Online (Advance/Full)', value: 4500, color: '#059669' },
  { name: 'Cash (At Venue)', value: 3200, color: '#D97706' },
  { name: 'Pending', value: 800, color: '#EF4444' },
];

const revenueTrend = [
  { week: 'Week 1', revenue: 2100 },
  { week: 'Week 2', revenue: 1900 },
  { week: 'Week 3', revenue: 2500 },
  { week: 'Week 4', revenue: 2000 },
];

export default function PaymentAnalytics() {
  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-xl font-display uppercase tracking-wider text-foreground mb-6">Payment Distribution</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80 border border-card-border rounded-xl p-4 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-500 mb-4 text-center">Revenue by Method</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentMethods}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {paymentMethods.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `₹${value}`}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-6 border border-card-border rounded-lg bg-green-50">
            <p className="text-sm text-green-800 font-medium">Total Online Revenue</p>
            <p className="text-4xl font-bold text-green-600 mt-2">₹4,500.00</p>
          </div>
          <div className="p-6 border border-card-border rounded-lg bg-yellow-50">
            <p className="text-sm text-yellow-800 font-medium">Total Cash Collected</p>
            <p className="text-4xl font-bold text-yellow-600 mt-2">₹3,200.00</p>
          </div>
          <div className="p-6 border border-card-border rounded-lg bg-red-50">
            <p className="text-sm text-red-800 font-medium">Outstanding Balance</p>
            <p className="text-4xl font-bold text-red-600 mt-2">₹800.00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
