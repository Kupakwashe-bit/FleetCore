'use client';

import React, { useState, useEffect } from 'react';
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
  Gauge,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('Failed to load dashboard metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const vehicles = stats?.vehicles || { total: 0, active: 0, dispatched: 0, maintenance: 0, resold: 0, categories: [] };
  const drivers = stats?.drivers || { total: 0, onTrip: 0, available: 0 };
  const compliance = stats?.compliance || { expired: 0, expiringSoon: 0, totalAlerts: 0 };
  const fraud = stats?.fraud || { pendingReview: 0 };
  const incidents = stats?.incidents || { activeCount: 0, recent: [] };

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
          <button
            onClick={fetchDashboardStats}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
            title="Refresh metrics"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
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
            <AlertTriangle className="h-4 w-4 text-red-400" />
            Incidents ({incidents.activeCount})
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vehicles */}
        <Link href="/vehicles" className="block p-5 rounded-2xl glass-panel glass-panel-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Fleet Vehicles</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{vehicles.total}</span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> {vehicles.active} Active
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {vehicles.dispatched} En Route • {vehicles.maintenance} In Maint • {vehicles.resold} Resold
          </p>
        </Link>

        {/* Drivers */}
        <Link href="/drivers" className="block p-5 rounded-2xl glass-panel glass-panel-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Roster Drivers</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{drivers.total}</span>
            <span className="text-xs text-blue-400 font-medium">
              {drivers.onTrip} En Route, {drivers.available} Available
            </span>
          </div>
          <p className="text-xs text-slate-400">100% Window-Scoped Privacy Protected</p>
        </Link>

        {/* Compliance */}
        <Link href="/compliance" className="block p-5 rounded-2xl glass-panel glass-panel-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">ZINARA & VID Alerts</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-amber-400">{compliance.totalAlerts}</span>
            {compliance.expired > 0 ? (
              <span className="text-xs text-red-400 font-bold px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800">
                {compliance.expired} EXPIRED
              </span>
            ) : (
              <span className="text-xs text-emerald-400 font-bold">All Valid</span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {compliance.expiringSoon} Expiring soon (ZINARA / VID / COF)
          </p>
        </Link>

        {/* Fraud Watch */}
        <Link href="/fraud" className="block p-5 rounded-2xl glass-panel glass-panel-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fraud & Anomaly Watch</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-purple-400">{fraud.pendingReview}</span>
            <span className="text-xs text-purple-300 font-medium">Pending Auditor</span>
          </div>
          <p className="text-xs text-slate-400">Fuel & Odometer Spike Engine Active</p>
        </Link>
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

          {incidents.recent.length === 0 ? (
            <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-center text-xs text-emerald-300">
              No active breakdowns or emergencies reported across the fleet network.
            </div>
          ) : (
            incidents.recent.map((inc: any) => (
              <div key={inc.id} className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                    {inc.severity} SEVERITY {inc.incidentType}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {new Date(inc.reportedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {inc.vehicle?.registrationNumber} ({inc.vehicle?.make} {inc.vehicle?.model}) — {inc.description}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-red-400" /> Location: {inc.locationName}
                  </p>
                </div>
                {inc.rescueVehicle && (
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5" /> Rescue Vehicle Dispatched: {inc.rescueVehicle.registrationNumber} ({inc.rescueVehicle.make})
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Fleet Category Distribution */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Mixed Fleet Categories</h3>
          <div className="space-y-3 text-xs">
            {vehicles.categories && vehicles.categories.length > 0 ? (
              vehicles.categories.map((cat: any) => (
                <div key={cat.category} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="font-medium text-slate-200">{cat.category.replace('_', ' ')}</span>
                  <span className="font-bold text-emerald-400">{cat.count} Registered</span>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-xs">Loading categories...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
