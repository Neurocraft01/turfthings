"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid or missing reset token.");
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("Password has been successfully reset. Redirecting to login...");
        setTimeout(() => {
          router.push("/admin/login");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Failed to connect to server.");
    }
  };

  return (
    <div className="bg-card w-full max-w-md p-8 rounded-xl border border-card-border shadow-2xl">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-brand/20 rounded-full flex items-center justify-center">
          <Lock size={32} className="text-brand" />
        </div>
      </div>
      
      <h1 className="font-display text-2xl text-foreground text-center uppercase tracking-wider mb-2">
        Set New Password
      </h1>

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
          <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
          <input 
            type="password" 
            required
            disabled={!token || !email || status === "success"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors disabled:opacity-50"
            placeholder="Enter new password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
          <input 
            type="password" 
            required
            disabled={!token || !email || status === "success"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors disabled:opacity-50"
            placeholder="Confirm new password"
          />
        </div>
        <button 
          type="submit" 
          disabled={status === "loading" || !token || !email || status === "success"}
          className="w-full bg-brand hover:bg-brand-hover text-black font-bold py-3 rounded-sm uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
        >
          {status === "loading" ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <span className="font-display text-4xl text-brand uppercase tracking-wider">
          Turf<span className="text-foreground">Admin</span>
        </span>
      </div>
      <Suspense fallback={<div className="text-foreground">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
