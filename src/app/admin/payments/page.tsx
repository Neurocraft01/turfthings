"use client";

import { Download, Search, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { useState } from "react";

type PaymentStatus = "Paid" | "Unpaid" | "Partial";

interface Payment {
  id: string;
  bookingId: string;
  customer: string;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  date: string;
  method: "Online" | "Cash" | "Card";
}

const MOCK_PAYMENTS: Payment[] = [
  { id: "PAY-901", bookingId: "TRF-10293", customer: "Rahul Sharma", amount: 1500, paidAmount: 1500, status: "Paid", date: "2026-06-01", method: "Online" },
  { id: "PAY-902", bookingId: "TRF-10294", customer: "Priya Desai", amount: 2000, paidAmount: 500, status: "Partial", date: "2026-06-01", method: "Online" },
  { id: "PAY-903", bookingId: "TRF-10295", customer: "Amit Patel", amount: 1200, paidAmount: 0, status: "Unpaid", date: "2026-06-02", method: "Cash" },
  { id: "PAY-904", bookingId: "TRF-10297", customer: "Vikram Singh", amount: 1500, paidAmount: 1500, status: "Paid", date: "2026-06-03", method: "Card" },
];

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPayments = MOCK_PAYMENTS.filter(payment => 
    payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
    payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "Paid": return <CheckCircle2 size={16} className="text-green-500 mr-2" />;
      case "Partial": return <Clock size={16} className="text-yellow-500 mr-2" />;
      case "Unpaid": return <AlertCircle size={16} className="text-red-500 mr-2" />;
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "Paid": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "Partial": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "Unpaid": return "text-red-500 bg-red-500/10 border-red-500/20";
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl text-foreground uppercase tracking-wider">Payments</h1>
          <p className="text-gray-400 mt-1">Track revenue and payment statuses</p>
        </div>
        <button className="bg-transparent border border-card-border hover:border-brand hover:text-brand text-foreground font-medium py-2.5 px-5 rounded-sm flex items-center transition-colors">
          <Download size={20} className="mr-2" /> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-xl border border-card-border border-l-4 border-l-brand">
          <h3 className="text-gray-400 text-sm font-medium mb-1">Total Expected (This Month)</h3>
          <div className="font-display text-4xl text-foreground tracking-wider">₹6,200</div>
        </div>
        <div className="bg-card p-6 rounded-xl border border-card-border border-l-4 border-l-green-500">
          <h3 className="text-gray-400 text-sm font-medium mb-1">Total Collected</h3>
          <div className="font-display text-4xl text-foreground tracking-wider">₹3,500</div>
        </div>
        <div className="bg-card p-6 rounded-xl border border-card-border border-l-4 border-l-red-500">
          <h3 className="text-gray-400 text-sm font-medium mb-1">Outstanding Balance</h3>
          <div className="font-display text-4xl text-foreground tracking-wider">₹2,700</div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-card-border overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-card-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by customer or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-card-border rounded-md pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-background text-xs uppercase font-medium text-gray-500 border-b border-card-border">
              <tr>
                <th className="px-6 py-4">Payment ID</th>
                <th className="px-6 py-4">Booking Ref</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Paid</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-foreground">{payment.id}</td>
                  <td className="px-6 py-4 font-mono">{payment.bookingId}</td>
                  <td className="px-6 py-4 text-foreground">{payment.customer}</td>
                  <td className="px-6 py-4">₹{payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 font-medium text-foreground">₹{payment.paidAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)} {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{payment.method}</td>
                  <td className="px-6 py-4">{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
