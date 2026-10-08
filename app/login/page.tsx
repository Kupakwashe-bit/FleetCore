'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Truck, ShieldCheck, Lock, Mail, Key, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@motalink.co.zw');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-500 items-center justify-center shadow-xl shadow-emerald-950/50 mb-2">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Mota<span className="text-emerald-500">Link</span> Logistics
          </h1>
          <p className="text-xs text-slate-400">
            Zimbabwean Fleet & Freight Single Source of Truth
          </p>
        </div>

        {/* Login Box */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white">Sign In to Command Center</h2>
            <p className="text-xs text-slate-400">Enter your credentials or pick a demo role below</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="name@motalink.co.zw"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Role Test Logins:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@motalink.co.zw')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left"
              >
                <span className="font-bold text-emerald-400 block">Admin</span>
                <span className="text-[10px] text-slate-400">admin@motalink.co.zw</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('dispatch@motalink.co.zw')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left"
              >
                <span className="font-bold text-amber-400 block">Dispatcher</span>
                <span className="text-[10px] text-slate-400">dispatch@motalink.co.zw</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('driver.tendai@motalink.co.zw')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left"
              >
                <span className="font-bold text-blue-400 block">Driver</span>
                <span className="text-[10px] text-slate-400">Tendai Mutasa</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('auditor@motalink.co.zw')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left"
              >
                <span className="font-bold text-purple-400 block">Auditor</span>
                <span className="text-[10px] text-slate-400">Rudo Mpofu</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
