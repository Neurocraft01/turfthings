"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle, AlertCircle, Loader2, FileSpreadsheet, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function SendReportPage() {
  const today = new Date();
  const [selectedYear,  setSelectedYear]  = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [result,  setResult]  = useState<{ type: "success" | "error"; message: string } | null>(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const years = Array.from({ length: 3 }, (_, i) => today.getFullYear() - i);

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year:  selectedYear,
          month: selectedMonth,
          email: recipientEmail || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ type: "success", message: data.message || "Report sent successfully!" });
      } else {
        setResult({ type: "error", message: data.error || "Failed to send report." });
      }
    } catch (e) {
      setResult({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-foreground uppercase tracking-wider">
          Monthly Report
        </h1>
        <p className="text-gray-400 mt-1">
          Send the monthly bookings Excel report via email
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-card-border rounded-2xl shadow-sm overflow-hidden">
        {/* Header band */}
        <div className="bg-gradient-to-r from-[#0a1a0c] to-[#1a3a1c] px-6 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center">
            <FileSpreadsheet size={22} className="text-brand" />
          </div>
          <div>
            <h2 className="text-white font-display text-lg uppercase tracking-wider">Bookings Report</h2>
            <p className="text-white/50 text-xs mt-0.5">Excel attachment with all booking data</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Month & Year selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand bg-white text-foreground"
              >
                {months.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand bg-white text-foreground"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Recipient email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Recipient Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Leave blank to use default (turfthings999@gmail.com)"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-brand transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Default recipient is configured in .env (SMTP_TO)
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <Calendar size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">
                {months[selectedMonth - 1]} {selectedYear} Report
              </p>
              <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                This will fetch <strong>all bookings</strong> for the selected month (including confirmed, pending, and cancelled)
                and send an Excel (.xlsx) attachment with complete booking data, plus a summary sheet.
              </p>
            </div>
          </div>

          {/* Result Alert */}
          {result && (
            <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium animate-in slide-in-from-bottom-2 ${
              result.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              {result.type === "success"
                ? <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                : <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />}
              {result.message}
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-brand text-white text-[14px] font-bold uppercase tracking-wider hover:bg-brand-hover transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-brand/20 hover:scale-[1.01]"
          >
            {sending ? (
              <><Loader2 size={18} className="animate-spin" /> Generating & Sending...</>
            ) : (
              <><Send size={16} /> Send {months[selectedMonth - 1]} {selectedYear} Report</>
            )}
          </button>
        </div>
      </div>

      {/* Auto-schedule info */}
      <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-xl mt-0.5">🗓️</div>
          <div>
            <p className="text-sm font-semibold text-green-800 mb-1">Auto-Schedule Active</p>
            <p className="text-xs text-green-700 leading-relaxed">
              The previous month's report is automatically emailed to{" "}
              <code className="bg-green-100 px-1 rounded">turfthings999@gmail.com</code> on the{" "}
              <strong>1st of every month at 8:00 AM IST</strong> via Vercel Cron.
            </p>
            <p className="text-xs text-green-600 mt-1.5">
              Cron endpoint: <code className="bg-green-100 px-1 rounded">GET /api/cron/monthly-report</code>
              &nbsp;·&nbsp; Schedule: <code className="bg-green-100 px-1 rounded">30 2 1 * *</code> (UTC)
            </p>
          </div>
        </div>
      </div>

      {/* SMTP Setup note */}
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-amber-800 mb-1">⚙️ SMTP Setup Required</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          Make sure to set <code className="bg-amber-100 px-1 rounded">SMTP_PASS</code> in your <code className="bg-amber-100 px-1 rounded">.env</code> file.
          For Gmail, generate an App Password at{" "}
          <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline text-amber-800">
            myaccount.google.com/apppasswords
          </a>
        </p>
      </div>
    </div>
  );
}
