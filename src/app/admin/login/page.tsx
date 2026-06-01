"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock auth for demonstration
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("adminAuth", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Invalid username or password");
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
            <Lock size={32} className="text-brand" />
          </div>
        </div>
        
        <h1 className="font-display text-2xl text-foreground text-center uppercase tracking-wider mb-8">
          Admin Login
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-md mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors"
              placeholder="Enter password"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-brand hover:bg-brand-hover text-black font-bold py-3 rounded-sm uppercase tracking-wider transition-colors"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Demo Credentials: admin / admin123</p>
        </div>
      </div>
    </div>
  );
}
