'use client';

import React from 'react';
import Link from 'next/link';
import {
  Truck,
  Users,
  Navigation,
  FileCheck,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Clock,
  Gauge
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#131b2e] to-emerald-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-white">Operational Command Center</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Fleet Control
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Single Source of Truth for Zimbabwean Logistics Operations across Harare, Bulawayo, Mutare & Gweru.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/trips"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition"
          >
            <Navigation className="h-4 w-4" />
            Dispatch New Trip
          </Link>
          <Link
            href="/incidents"
            className="px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-sm font-semibold flex items-center gap-2 transition"
          >
            <AlertTriangle className="h-4 w-4" />
            Incidents (1)
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Active Vehicles</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">5</span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> 1 Resold
            </span>
          </div>
          <p className="text-xs text-slate-400">1 Haulage, 1 Lorry, 1 Bus Taxi, 1 Small, 1 Tricycle</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel glass-panel-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Drivers</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">2</span>
            <span className="text-xs text-slate-400 font-medium">1 En Route, 1 Available</span>
          </div>
          <p className="text-xs text-slate-400">Avg Safety Score: 4.85 / 5.0</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel glass-panel-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">ZINARA / Compliance Alerts</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-amber-400">2</span>
            <span className="text-xs text-red-400 font-bold">1 EXPIRED</span>
          </div>
          <p className="text-xs text-slate-400">ZINARA License due in 10 days</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel glass-panel-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fraud & Anomaly Watch</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-purple-400">1</span>
            <span className="text-xs text-purple-300 font-medium">Fuel Spike +50%</span>
          </div>
          <p className="text-xs text-slate-400">Pending manual auditor review</p>
        </div>
      </div>

      {/* Operational Highlights & Incident Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Escalation Box */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
              <h3 className="text-lg font-bold text-white">Active Breakdown & Rescue Control</h3>
            </div>
            <Link href="/incidents" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
              View Ticket Chain <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                HIGH SEVERITY BREAKDOWN
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Reported 5 hours ago
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">DAF Haulage Truck (AGE-4920) - Turboshaft Pressure Loss</h4>
              <p className="text-xs text-slate-300 mt-1">
                Location: A3 Highway (25km outside Marondera). Cargo: 28 Tonnes Fertilizer Bagged Freight.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-emerald-400 flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" /> Rescue Vehicle Dispatched: ISUZU 10-Ton Lorry (BCE-9102)
              </div>
              <p className="text-slate-400">Ownership Chain: Driver Alert → Chipo Sibanda (Dispatcher) → Rescue En Route</p>
            </div>
          </div>
        </div>

        {/* Fleet Category Distribution */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Mixed Fleet Categories</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-medium text-slate-200">Haulage Trucks (30+ Ton)</span>
              <span className="font-bold text-emerald-400">1 Active</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-medium text-slate-200">Medium Lorries (10 Ton)</span>
              <span className="font-bold text-emerald-400">1 Active</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-medium text-slate-200">Bus Taxis (Commuter HiAce)</span>
              <span className="font-bold text-emerald-400">1 Active</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-medium text-slate-200">Small Delivery Vehicles</span>
              <span className="font-bold text-emerald-400">1 Active</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-medium text-slate-200">Cargo Tricycles (Tuk-Tuk)</span>
              <span className="font-bold text-emerald-400">1 Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
