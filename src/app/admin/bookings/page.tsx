"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, Plus, MoreVertical, Edit, Trash2, CheckCircle, XCircle, Clock, CalendarCheck, X } from "lucide-react";

type BookingStatus = "confirmed" | "pending" | "cancelled";
type PaymentMethod = "online" | "cash" | "pending";

interface Booking {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  time: string;
  sport: string;
  status: BookingStatus;
  totalAmount: number;
  advancePaid: number;
  advanceMethod: PaymentMethod;
  balanceRemaining: number;
  balanceMethod: PaymentMethod;
}

const INITIAL_BOOKINGS: Booking[] = [
  { id: "TRF-10293", customerName: "Rahul Sharma", phone: "+91 98765 43210", date: "2026-06-01", time: "18:00", sport: "Box Cricket", status: "confirmed", totalAmount: 1500, advancePaid: 500, advanceMethod: "online", balanceRemaining: 1000, balanceMethod: "cash" },
  { id: "TRF-10294", customerName: "Amit Patel", phone: "+91 87654 32109", date: "2026-06-01", time: "19:00", sport: "Football (5v5)", status: "pending", totalAmount: 1200, advancePaid: 0, advanceMethod: "pending", balanceRemaining: 1200, balanceMethod: "pending" },
];

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    customerName: "",
    phone: "",
    date: "",
    time: "",
    sport: "Football (5v5)",
    status: "confirmed",
    totalAmount: 100,
    advancePaid: 0,
    advanceMethod: "online",
    balanceRemaining: 100,
    balanceMethod: "pending"
  });

  const handleTotalChange = (val: number) => {
    setNewBooking(prev => ({
      ...prev,
      totalAmount: val,
      balanceRemaining: val - (prev.advancePaid || 0)
    }));
  };

  const handleAdvanceChange = (val: number) => {
    setNewBooking(prev => ({
      ...prev,
      advancePaid: val,
      balanceRemaining: (prev.totalAmount || 0) - val
    }));
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Booking = {
      ...newBooking,
      id: `TRF-${Math.floor(10000 + Math.random() * 90000)}`,
    } as Booking;
    
    setBookings([created, ...bookings]);
    setIsModalOpen(false);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-700 border border-green-500/20"><CheckCircle size={12} className="mr-1" /> Confirmed</span>;
      case "pending":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-700 border border-yellow-500/20"><Clock size={12} className="mr-1" /> Pending</span>;
      case "cancelled":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-700 border border-red-500/20"><XCircle size={12} className="mr-1" /> Cancelled</span>;
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl text-foreground uppercase tracking-wider">Bookings</h1>
          <p className="text-gray-500 mt-1">Manage all turf reservations</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand hover:bg-brand-hover text-white font-bold py-2.5 px-5 rounded-sm uppercase tracking-wider flex items-center transition-colors shadow-md"
        >
          <Plus size={20} className="mr-2" /> Add Entry
        </button>
      </div>

      <div className="bg-card rounded-xl border border-card-border overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-card-border flex flex-col sm:flex-row gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-card-border rounded-md pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-brand transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-card-border rounded-md px-4 py-2 text-sm text-foreground focus:outline-none focus:border-brand transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-card-border">
              <tr>
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Financials</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border bg-white">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-foreground font-medium">{booking.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{booking.customerName}</div>
                    <div className="text-xs text-gray-500">{booking.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{booking.date ? format(new Date(booking.date), "MMM dd, yyyy") : ''}</div>
                    <div className="text-xs text-gray-500">{booking.time} • {booking.sport}</div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      <span className="text-gray-500">Total:</span> <span className="font-semibold">₹{booking.totalAmount}</span>
                    </div>
                    <div className="text-xs mt-1">
                      <span className="text-gray-500">Adv ({booking.advanceMethod}):</span> <span className="text-green-600 font-medium">₹{booking.advancePaid}</span>
                    </div>
                    <div className="text-xs mt-1">
                      <span className="text-gray-500">Bal ({booking.balanceMethod}):</span> <span className="text-accent font-medium">₹{booking.balanceRemaining}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="p-1 text-gray-400 hover:text-brand transition-colors" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Cancel">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <CalendarCheck size={48} className="mb-4 opacity-20" />
                      <p>No bookings found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-card-border animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-card-border bg-gray-50/50">
              <h2 className="font-display text-2xl text-foreground uppercase tracking-wider">New Booking Entry</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateBooking} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Customer Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-brand uppercase tracking-wider border-b pb-2">Customer Info</h3>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                    <input type="text" required value={newBooking.customerName} onChange={e => setNewBooking({...newBooking, customerName: e.target.value})} className="w-full bg-white border border-card-border rounded-md px-3 py-2 text-sm focus:border-brand outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                    <input type="tel" required value={newBooking.phone} onChange={e => setNewBooking({...newBooking, phone: e.target.value})} className="w-full bg-white border border-card-border rounded-md px-3 py-2 text-sm focus:border-brand outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                      <input type="date" required value={newBooking.date} onChange={e => setNewBooking({...newBooking, date: e.target.value})} className="w-full bg-white border border-card-border rounded-md px-3 py-2 text-sm focus:border-brand outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
                      <input type="time" required value={newBooking.time} onChange={e => setNewBooking({...newBooking, time: e.target.value})} className="w-full bg-white border border-card-border rounded-md px-3 py-2 text-sm focus:border-brand outline-none" />
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-accent uppercase tracking-wider border-b pb-2">Financials</h3>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Total Amount (₹)</label>
                    <input type="number" required value={newBooking.totalAmount} onChange={e => handleTotalChange(Number(e.target.value))} className="w-full bg-white border border-card-border rounded-md px-3 py-2 text-sm focus:border-brand outline-none font-semibold text-foreground" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Advance Paid</label>
                      <input type="number" required value={newBooking.advancePaid} onChange={e => handleAdvanceChange(Number(e.target.value))} className="w-full bg-white border border-card-border rounded-md px-3 py-2 text-sm focus:border-brand outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Method</label>
                      <select value={newBooking.advanceMethod} onChange={e => setNewBooking({...newBooking, advanceMethod: e.target.value as PaymentMethod})} className="w-full bg-white border border-card-border rounded-md px-3 py-2 text-sm focus:border-brand outline-none">
                        <option value="online">Online</option>
                        <option value="cash">Cash</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Balance Remaining</label>
                      <input type="number" disabled value={newBooking.balanceRemaining} className="w-full bg-white border border-card-border rounded-md px-3 py-2 text-sm text-gray-500 font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Balance Method</label>
                      <select value={newBooking.balanceMethod} onChange={e => setNewBooking({...newBooking, balanceMethod: e.target.value as PaymentMethod})} className="w-full bg-white border border-card-border rounded-md px-3 py-2 text-sm focus:border-brand outline-none">
                        <option value="pending">Pending / Unpaid</option>
                        <option value="cash">Paid in Cash</option>
                        <option value="online">Paid Online</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-card-border mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-md text-sm font-bold bg-brand hover:bg-brand-hover text-white transition-colors shadow-sm">
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
