'use client';

import React from 'react';
import { Truck, ShieldCheck, MapPin, User, RefreshCw, Radio } from 'lucide-react';

interface NavbarProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  selectedDepot: string;
  onDepotChange: (depot: string) => void;
  isOnline: boolean;
  pendingSyncCount: number;
  onManualSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  selectedDepot,
  onDepotChange,
  isOnline,
  pendingSyncCount,
  onManualSync,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0b0f19]/90 backdrop-blur-md px-4 py-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">Mota<span className="text-emerald-500">Link</span></h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                PROD v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Integrated Zimbabwean Fleet & Logistics Single Source of Truth</p>
          </div>
        </div>

        {/* Operational Controls & Role Switcher */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Offline Sync Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
            isOnline 
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' 
              : 'bg-amber-950/40 border-amber-800/60 text-amber-300 animate-pulse'
          }`}>
            <Radio className={`h-4 w-4 ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{isOnline ? 'Network Connected' : 'Offline Route Mode'}</span>
            {pendingSyncCount > 0 && (
              <button
                onClick={onManualSync}
                className="ml-1 px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-1 transition"
                title="Sync queued trip data to central database"
              >
                <RefreshCw className="h-3 w-3 animate-spin" />
                Sync ({pendingSyncCount})
              </button>
            )}
          </div>

          {/* Depot Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
            <select
              value={selectedDepot}
              onChange={(e) => onDepotChange(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Depots (Zimbabwe)</option>
              <option value="HRE-DEPOT" className="bg-slate-900 text-white">Harare Central Hub</option>
              <option value="BYO-HUB" className="bg-slate-900 text-white">Bulawayo Freight Terminal</option>
              <option value="MTR-DEPOT" className="bg-slate-900 text-white">Mutare Border Depot</option>
              <option value="GWU-YARD" className="bg-slate-900 text-white">Gweru Industrial Yard</option>
            </select>
          </div>

          {/* RBAC Role Simulator */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <User className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-slate-400 hidden sm:inline">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ADMIN" className="bg-slate-900 text-white">Admin (Full Control)</option>
              <option value="FLEET_MANAGER" className="bg-slate-900 text-white">Fleet Manager</option>
              <option value="DISPATCHER" className="bg-slate-900 text-white">Dispatcher</option>
              <option value="DRIVER" className="bg-slate-900 text-white">Driver (Tendai Mutasa)</option>
              <option value="AUDITOR" className="bg-slate-900 text-white">Compliance Auditor</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
