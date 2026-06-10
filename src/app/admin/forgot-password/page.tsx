"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("If the email exists, a reset link has been sent.");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Failed to connect to server.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <span className="font-display text-4xl text-brand uppercase tracking-wider">
          Turf<span className="text-foreground">Admin</span>
        </span>
      </div>
      
      <div className="bg-card w-full max-w-md p-8 rounded-xl border border-card-border shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-brand/20 rounded-full flex items-center justify-center">
            <Mail size={32} className="text-brand" />
          </div>
        </div>
        
        <h1 className="font-display text-2xl text-foreground text-center uppercase tracking-wider mb-2">
          Reset Password
        </h1>
        <p className="text-center text-sm text-gray-400 mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {status === "error" && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-md mb-6 text-center">
            {message}
          </div>
        )}
        
        {status === "success" && (
          <div className="bg-brand/10 border border-brand/50 text-brand text-sm p-3 rounded-md mb-6 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors"
              placeholder="Enter email address"
            />
          </div>
          <button 
            type="submit" 
            disabled={status === "loading"}
            className="w-full bg-brand hover:bg-brand-hover text-black font-bold py-3 rounded-sm uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            {status === "loading" ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <Link href="/admin/login" className="text-gray-400 hover:text-foreground transition-all">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
