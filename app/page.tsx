"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { UserRole } from "./types";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const DASHBOARD_URLS: Record<string, string> = {
        [process.env.NEXT_PUBLIC_CLIENT_EMAIL!]: "/client_dashboard",
        [process.env.NEXT_PUBLIC_SUPPLIER_EMAIL!]: "/supplier_dashboard",
      };

      const destination = DASHBOARD_URLS[email] || "/client_dashboard";

      if (destination == "/client_dashboard") {
        UserRole: "client";
      } else {
        UserRole: "supplier";
      }
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      {/* Logo Section */}
      <div className="mb-24 flex flex-col items-center text-center">
        <h1 className="font-serif text-5xl italic text-slate-900 mb-2">
          François
        </h1>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500 font-medium">
          BERTHO
        </p>
      </div>

      {/* Login Section */}
      <div className="flex w-full max-w-md flex-col items-center">
        <h2 className="mb-8 font-serif text-4xl text-[#1a237e]">Login</h2>

        <div className="w-full rounded-lg border border-slate-100 bg-white p-8 shadow-[0_25px_50px_-12px_rgb(0,0,0,0.25)] transition-all hover:shadow-[0_30px_60px_-15px_rgb(0,0,0,0.3)]">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {error && (
              <div className="rounded bg-red-50 p-3 text-sm text-red-500 border border-red-100 text-center">
                {error}
              </div>
            )}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded border bg-transparent px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${error ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-slate-800"
                  }`}
                disabled={loading}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded border bg-transparent px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${error ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-slate-800"
                  }`}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded bg-black py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
