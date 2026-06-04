"use client";

import { useState, useEffect } from "react";
import { Search, Mail, MailOpen, MailPlus, CheckCircle2, Trash2 } from "lucide-react";

type InquiryStatus = "New" | "Read" | "Replied";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  sport: string;
  status: InquiryStatus;
  createdAt: string;
}

export default function ContactsManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contacts");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
      }
    } catch (e) {
      console.error("Failed to fetch inquiries", e);
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (id: string, newStatus: InquiryStatus) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setInquiries(prev => prev.filter(inq => inq.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete inquiry", e);
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => 
    inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: InquiryStatus) => {
    switch (status) {
      case "New": return <Mail className="text-brand mr-2" size={16} />;
      case "Read": return <MailOpen className="text-gray-400 mr-2" size={16} />;
      case "Replied": return <CheckCircle2 className="text-green-500 mr-2" size={16} />;
    }
  };

  const getStatusColor = (status: InquiryStatus) => {
    switch (status) {
      case "New": return "text-brand bg-brand/10 border-brand/20";
      case "Read": return "text-gray-400 bg-gray-500/10 border-gray-500/20";
      case "Replied": return "text-green-500 bg-green-500/10 border-green-500/20";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-foreground uppercase tracking-wider">Inquiries</h1>
        <p className="text-gray-400 mt-1">Manage messages from the contact form</p>
      </div>

      <div className="bg-card rounded-xl border border-card-border overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-card-border">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-card-border rounded-md pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-background text-xs uppercase font-medium text-gray-500 border-b border-card-border">
              <tr>
                <th className="px-6 py-4">Sender</th>
                <th className="px-6 py-4">Message Details</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    Loading inquiries...
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No inquiries found.
                  </td>
                </tr>
              ) : filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id} className={`transition-colors ${inquiry.status === 'New' ? 'bg-background/80 hover:bg-background' : 'hover:bg-background/50'}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{inquiry.name}</div>
                    <div className="text-xs">{inquiry.email}</div>
                    <div className="text-xs">{inquiry.phone}</div>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <div className="text-xs text-brand/80 font-medium mb-1 uppercase tracking-wider">Sport interest: {inquiry.sport}</div>
                    <p className={`text-sm ${inquiry.status === 'New' ? 'text-foreground font-medium' : 'text-gray-400'}`}>
                      {inquiry.message}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(inquiry.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(inquiry.status)}`}>
                      {getStatusIcon(inquiry.status)} {inquiry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {inquiry.status === 'New' && (
                        <button 
                          onClick={() => updateInquiryStatus(inquiry.id, 'Read')}
                          className="p-1.5 bg-background border border-card-border rounded hover:text-foreground transition-colors"
                          title="Mark as read"
                        >
                          <MailOpen size={16} />
                        </button>
                      )}
                      <a 
                        href={`mailto:${inquiry.email}?subject=Re: Inquiry at TurfBooking`}
                        className="p-1.5 bg-brand text-black rounded hover:bg-brand-hover transition-colors inline-flex"
                        title="Reply via Email"
                        onClick={() => updateInquiryStatus(inquiry.id, 'Replied')}
                      >
                        <MailPlus size={16} />
                      </a>
                      <button 
                        onClick={() => deleteInquiry(inquiry.id)}
                        className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-foreground transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
