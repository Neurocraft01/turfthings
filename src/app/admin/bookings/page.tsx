"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Search, Plus, Clock, CalendarCheck, X, CheckCircle, XCircle, TrendingUp, Users, Calendar as CalendarIcon, Phone } from "lucide-react";

type BookingStatus = "confirmed" | "pending" | "cancelled";

interface Booking {
  id: string;
  playerName: string;
  mobileNumber: string;
  bookingDate: string;
  slotStart: string;
  slotEnd: string;
  totalSlots: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  bookingStatus: BookingStatus;
  messageStatus: string | null;
}

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  
  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // New Booking State
  const [newBooking, setNewBooking] = useState({
    playerName: "",
    mobileNumber: "",
    bookingDate: format(new Date(), "yyyy-MM-dd"),
    slotStart: "18:00",
    totalSlots: 1, // Default 1 hour
    totalAmount: 1200,
    paidAmount: 600,
  });

  // Extend Booking State
  const [extendSlots, setExtendSlots] = useState(1);
  const [additionalAmount, setAdditionalAmount] = useState(400);

  // Available Slots calculation for dropdowns (simple generation for admin)
  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      options.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  useEffect(() => {
    fetchBookings();
  }, [dateFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?date=${dateFilter}`);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calculate End Time
      const [startH, startM] = newBooking.slotStart.split(':').map(Number);
      const totalMins = (startH * 60) + startM + (newBooking.totalSlots * 60);
      const endH = Math.floor(totalMins / 60);
      const endM = totalMins % 60;
      const slotEnd = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newBooking,
          slotEnd,
          bookingStatus: "confirmed"
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create booking");
        return;
      }

      setIsNewModalOpen(false);
      fetchBookings();
    } catch (error) {
      console.error("Failed to create", error);
      alert("Error creating booking");
    }
  };

  const handleUpdateStatus = async (id: string, status: BookingStatus) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingStatus: status }),
      });
      fetchBookings();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleExtendBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extendSlots,
          additionalAmount,
          paidAmount: selectedBooking.paidAmount // Assuming they didn't pay the extra yet, or we could add a field for it
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to extend booking");
        return;
      }

      setIsExtendModalOpen(false);
      fetchBookings();
    } catch (error) {
      console.error("Failed to extend", error);
    }
  };

  // Client-side filtering for Search and Status
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.playerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.mobileNumber.includes(searchTerm) ||
                          b.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Daily Summaries
  const totalBookings = filteredBookings.length;
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.bookingStatus !== 'cancelled' ? b.totalAmount : 0), 0);
  const totalCollected = filteredBookings.reduce((sum, b) => sum + (b.bookingStatus !== 'cancelled' ? b.paidAmount : 0), 0);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-700 border border-green-500/20"><CheckCircle size={12} className="mr-1" /> Confirmed</span>;
      case "pending": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-700 border border-yellow-500/20"><Clock size={12} className="mr-1" /> Pending</span>;
      case "cancelled": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-700 border border-red-500/20"><XCircle size={12} className="mr-1" /> Cancelled</span>;
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-4xl text-foreground uppercase tracking-wider">Bookings</h1>
          <p className="text-gray-500 mt-1">Manage all turf reservations</p>
        </div>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="bg-brand hover:bg-brand-hover text-white font-bold py-2.5 px-5 rounded-sm uppercase tracking-wider flex items-center transition-colors shadow-md"
        >
          <Plus size={20} className="mr-2" /> Add Booking
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-card-border p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><Users size={24} /></div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Bookings</div>
            <div className="text-2xl font-display text-foreground">{totalBookings}</div>
          </div>
        </div>
        <div className="bg-white border border-card-border p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-lg text-green-600"><TrendingUp size={24} /></div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Expected Revenue</div>
            <div className="text-2xl font-display text-foreground">₹{totalRevenue.toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-white border border-card-border p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-brand/10 p-3 rounded-lg text-brand"><CheckCircle size={24} /></div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Collected Amount</div>
            <div className="text-2xl font-display text-foreground">₹{totalCollected.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-card-border overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-card-border flex flex-col sm:flex-row gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, phone or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-card-border rounded-md pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-brand transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-white border border-card-border rounded-md px-4 py-2 text-sm text-foreground focus:outline-none focus:border-brand transition-colors"
            />
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
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4">Timing</th>
                <th className="px-6 py-4">Status & Comm.</th>
                <th className="px-6 py-4">Financials</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border bg-white">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12">Loading bookings...</td></tr>
              ) : filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{booking.playerName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone size={10} /> {booking.mobileNumber}</div>
                    <div className="text-[10px] text-gray-400 mt-1 font-mono">{booking.id.slice(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{booking.slotStart} - {booking.slotEnd}</div>
                    <div className="text-xs text-gray-500">{booking.totalSlots} hours ({booking.totalSlots * 60} mins)</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="mb-2">{getStatusBadge(booking.bookingStatus)}</div>
                    {booking.messageStatus === 'sent' && <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-sm">WA Sent ✓</span>}
                    {booking.messageStatus === 'failed' && <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-sm">WA Failed ✗</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      <span className="text-gray-500">Total:</span> <span className="font-semibold">₹{booking.totalAmount}</span>
                    </div>
                    <div className="text-xs mt-1">
                      <span className="text-gray-500">Paid:</span> <span className="text-green-600 font-medium">₹{booking.paidAmount}</span>
                    </div>
                    <div className="text-xs mt-1">
                      <span className="text-gray-500">Bal:</span> <span className="text-red-500 font-medium">₹{booking.remainingAmount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {booking.bookingStatus === 'pending' && (
                        <button onClick={() => handleUpdateStatus(booking.id, 'confirmed')} className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded">
                          Confirm
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsExtendModalOpen(true);
                        }} 
                        disabled={booking.bookingStatus === 'cancelled'}
                        className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded disabled:opacity-50"
                      >
                        Extend
                      </button>
                      {booking.bookingStatus !== 'cancelled' && (
                        <button onClick={() => handleUpdateStatus(booking.id, 'cancelled')} className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded">
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {!loading && filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <CalendarCheck size={48} className="mb-4 opacity-20" />
                      <p>No bookings found matching your filters for this date.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Booking Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-card-border animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-card-border bg-gray-50/50">
              <h2 className="font-display text-xl text-foreground uppercase tracking-wider">New Booking</h2>
              <button onClick={() => setIsNewModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Player Name</label>
                <input type="text" required value={newBooking.playerName} onChange={e => setNewBooking({...newBooking, playerName: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Mobile Number (For WhatsApp)</label>
                <input type="tel" required value={newBooking.mobileNumber} onChange={e => setNewBooking({...newBooking, mobileNumber: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-brand" placeholder="+91..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                  <input type="date" required value={newBooking.bookingDate} onChange={e => setNewBooking({...newBooking, bookingDate: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                  <select required value={newBooking.slotStart} onChange={e => setNewBooking({...newBooking, slotStart: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-brand">
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Duration (Hours)</label>
                  <select required value={newBooking.totalSlots} onChange={e => setNewBooking({...newBooking, totalSlots: Number(e.target.value)})} className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-brand">
                    <option value={1}>1 Hour</option>
                    <option value={2}>2 Hours</option>
                    <option value={3}>3 Hours</option>
                    <option value={4}>4 Hours</option>
                    <option value={5}>5 Hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Total Price (₹)</label>
                  <input type="number" required value={newBooking.totalAmount} onChange={e => setNewBooking({...newBooking, totalAmount: Number(e.target.value)})} className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-brand" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Advance / Paid Amount (₹)</label>
                <input type="number" required value={newBooking.paidAmount} onChange={e => setNewBooking({...newBooking, paidAmount: Number(e.target.value)})} className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md text-sm font-bold bg-brand text-white hover:bg-brand-hover">Book Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extend Booking Modal */}
      {isExtendModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border border-card-border animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-card-border bg-gray-50/50">
              <h2 className="font-display text-xl text-foreground tracking-wider">Extend Booking</h2>
              <button onClick={() => setIsExtendModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleExtendBooking} className="p-6 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                <div className="text-xs text-blue-800 font-medium">Extending {selectedBooking.playerName}'s session</div>
                <div className="text-sm font-bold text-blue-900 mt-1">Current End Time: {selectedBooking.slotEnd}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Add Duration (Hours)</label>
                <select required value={extendSlots} onChange={e => setExtendSlots(Number(e.target.value))} className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-brand">
                  <option value={1}>+ 1 Hour</option>
                  <option value={2}>+ 2 Hours</option>
                  <option value={3}>+ 3 Hours</option>
                  <option value={4}>+ 4 Hours</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Additional Charges (₹)</label>
                <input type="number" required value={additionalAmount} onChange={e => setAdditionalAmount(Number(e.target.value))} className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsExtendModalOpen(false)} className="px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md text-sm font-bold bg-brand text-white hover:bg-brand-hover">Confirm Extension</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
