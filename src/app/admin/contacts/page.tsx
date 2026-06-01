"use client";

import { useState } from "react";
import { Search, Mail, MailOpen, MailPlus, CheckCircle2, Trash2 } from "lucide-react";

type InquiryStatus = "New" | "Read" | "Replied";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: InquiryStatus;
}

const MOCK_INQUIRIES: Inquiry[] = [
  { id: "INQ-001", name: "Robert Fox", email: "robert@example.com", phone: "+1 234 567 8900", message: "Hi, I wanted to ask about corporate tournament bookings for next month. Do you offer bulk discounts?", date: "2026-05-31 10:30 AM", status: "New" },
  { id: "INQ-002", name: "Esther Howard", email: "esther@example.com", phone: "+1 987 654 3210", message: "I left my water bottle at the venue yesterday. Has anyone found it?", date: "2026-05-30 04:15 PM", status: "Read" },
  { id: "INQ-003", name: "Cameron Williamson", email: "cameron@example.com", phone: "+1 555 123 4567", message: "Can we rent bibs and a ball at the venue?", date: "2026-05-29 09:00 AM", status: "Replied" },
];

export default function ContactsManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inquiries, setInquiries] = useState(MOCK_INQUIRIES);

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

  const markAsRead = (id: string) => {
    setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, status: "Read" } : inq));
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
              {filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id} className={`transition-colors ${inquiry.status === 'New' ? 'bg-background/80 hover:bg-background' : 'hover:bg-background/50'}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{inquiry.name}</div>
                    <div className="text-xs">{inquiry.email}</div>
                    <div className="text-xs">{inquiry.phone}</div>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className={`truncate ${inquiry.status === 'New' ? 'text-foreground font-medium' : 'text-gray-400'}`}>
                      {inquiry.message}
                    </p>
                  </td>
                  <td className="px-6 py-4">{inquiry.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(inquiry.status)}`}>
                      {getStatusIcon(inquiry.status)} {inquiry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {inquiry.status === 'New' && (
                        <button 
                          onClick={() => markAsRead(inquiry.id)}
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
                        onClick={() => setInquiries(inquiries.map(inq => inq.id === inquiry.id ? { ...inq, status: "Replied" } : inq))}
                      >
                        <MailPlus size={16} />
                      </a>
                      <button className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-foreground transition-colors" title="Delete">
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
