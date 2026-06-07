"use client";

import { useState, useEffect } from "react";
import { Download, Search, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";

type PaymentStatus = "Paid" | "Unpaid" | "Partial";

interface Payment {
  id: string;
  bookingId: string;
  customer: string;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  date: string;
  method: string;
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings"); // Fetches all bookings
      if (res.ok) {
        const data = await res.json();
        const bookingsList = data.bookings || [];
        
        // Map bookings to payments dynamically
        const mappedPayments: Payment[] = bookingsList.flatMap((booking: any) => {
          const list: Payment[] = [];
          const hasPayments = (booking.firstPaidAmount ?? 0) > 0 || (booking.secondPaidAmount ?? 0) > 0;

          // First Payment Row (Advance)
          if ((booking.firstPaidAmount ?? 0) > 0 || !hasPayments) {
            let status: PaymentStatus = "Paid";
            if (booking.remainingAmount > 0) {
              status = (booking.firstPaidAmount ?? booking.paidAmount ?? 0) > 0 ? "Partial" : "Unpaid";
            }
            if (booking.bookingStatus === "cancelled") {
              status = "Unpaid";
            }

            list.push({
              id: `PAY-${booking.id.slice(-6).toUpperCase()}-1`,
              bookingId: booking.id.slice(-8).toUpperCase(),
              customer: `${booking.playerName} (1st)`,
              amount: booking.totalAmount,
              paidAmount: booking.bookingStatus === "cancelled" ? 0 : (booking.firstPaidAmount ?? booking.paidAmount ?? 0),
              status: booking.bookingStatus === "cancelled" ? "Unpaid" : status,
              date: booking.bookingDate,
              method: booking.firstPaymentMethod || booking.paymentMethod || (booking.paidAmount > 0 ? "Online" : "None")
            });
          }

          // Second Payment Row (Final)
          if ((booking.secondPaidAmount ?? 0) > 0) {
            let status: PaymentStatus = "Paid";
            if (booking.remainingAmount > 0) {
              status = "Partial";
            }
            if (booking.bookingStatus === "cancelled") {
              status = "Unpaid";
            }

            list.push({
              id: `PAY-${booking.id.slice(-6).toUpperCase()}-2`,
              bookingId: booking.id.slice(-8).toUpperCase(),
              customer: `${booking.playerName} (2nd)`,
              amount: booking.totalAmount,
              paidAmount: booking.bookingStatus === "cancelled" ? 0 : booking.secondPaidAmount,
              status: booking.bookingStatus === "cancelled" ? "Unpaid" : status,
              date: booking.bookingDate,
              method: booking.secondPaymentMethod || "Online"
            });
          }

          return list;
        });

        setPayments(mappedPayments);
      }
    } catch (e) {
      console.error("Failed to fetch payments data", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => 
    payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
    payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute live summaries
  const seenBookings = new Set<string>();
  let totalExpected = 0;
  filteredPayments.forEach(p => {
    if (!seenBookings.has(p.bookingId)) {
      seenBookings.add(p.bookingId);
      totalExpected += p.amount;
    }
  });
  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.paidAmount, 0);
  const outstandingBalance = totalExpected - totalCollected;

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

  const exportCSV = () => {
    if (filteredPayments.length === 0) return;
    const headers = "Payment ID,Booking Ref,Customer,Total Amount,Paid Amount,Status,Method,Date\n";
    const rows = filteredPayments.map(p => 
      `"${p.id}","${p.bookingId}","${p.customer}",${p.amount},${p.paidAmount},"${p.status}","${p.method}","${p.date}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `turf_payments_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl text-foreground uppercase tracking-wider">Payments</h1>
          <p className="text-gray-400 mt-1">Track revenue and payment statuses</p>
        </div>
        <button 
          onClick={exportCSV}
          className="bg-transparent border border-card-border hover:border-brand hover:text-brand text-foreground font-medium py-2.5 px-5 rounded-sm flex items-center transition-colors"
        >
          <Download size={20} className="mr-2" /> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-xl border border-card-border border-l-4 border-l-brand">
          <h3 className="text-gray-400 text-sm font-medium mb-1">Total Expected (Filtered)</h3>
          <div className="font-display text-4xl text-foreground tracking-wider">₹{totalExpected.toLocaleString("en-IN")}</div>
        </div>
        <div className="bg-card p-6 rounded-xl border border-card-border border-l-4 border-l-green-500">
          <h3 className="text-gray-400 text-sm font-medium mb-1">Total Collected</h3>
          <div className="font-display text-4xl text-foreground tracking-wider">₹{totalCollected.toLocaleString("en-IN")}</div>
        </div>
        <div className="bg-card p-6 rounded-xl border border-card-border border-l-4 border-l-red-500">
          <h3 className="text-gray-400 text-sm font-medium mb-1">Outstanding Balance</h3>
          <div className="font-display text-4xl text-foreground tracking-wider">₹{outstandingBalance.toLocaleString("en-IN")}</div>
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
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    Loading payments...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    No payment records found.
                  </td>
                </tr>
              ) : filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-foreground">{payment.id}</td>
                  <td className="px-6 py-4 font-mono">{payment.bookingId}</td>
                  <td className="px-6 py-4 text-foreground">{payment.customer}</td>
                  <td className="px-6 py-4">₹{payment.amount.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 font-medium text-foreground">₹{payment.paidAmount.toLocaleString("en-IN")}</td>
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
