'use client';

import React, { useState } from 'react';
import { Users, ShieldCheck, Award, Lock, Eye, Calendar, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export default function DriversPage() {
  const [activeTab, setActiveTab] = useState<'MANAGEMENT' | 'PRIVACY_POLICY'>('MANAGEMENT');

  const drivers = [
    {
      id: 'drv-1',
      name: 'Tendai Mutasa',
      email: 'driver.tendai@motalink.co.zw',
      licenseNumber: 'ZIM-DL-984021',
      licenseClasses: 'Class 1 Heavy, Class 2 Bus',
      licenseExpiry: '2027-08-08',
      medicalCertExpiry: '2027-02-08',
      status: 'ON_TRIP',
      depot: 'Harare Central Hub',
      safetyRating: 4.8,
      efficiencyRating: 4.6,
      punctualityRating: 4.9,
      currentTrip: 'Harare to Forbes Border Post (Mutare)',
    },
    {
      id: 'drv-2',
      name: 'Farai Dube',
      email: 'driver.farai@motalink.co.zw',
      licenseNumber: 'ZIM-DL-412903',
      licenseClasses: 'Class 1 Heavy',
      licenseExpiry: '2027-03-15',
      medicalCertExpiry: '2026-11-10',
      status: 'AVAILABLE',
      depot: 'Bulawayo Freight Terminal',
      safetyRating: 4.9,
      efficiencyRating: 4.8,
      punctualityRating: 4.7,
      currentTrip: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Driver Hub & Performance</h2>
          <p className="text-sm text-slate-400">Licensing, certification, performance ratings & privacy compliance</p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('MANAGEMENT')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'MANAGEMENT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Driver Roster
          </button>
          <button
            onClick={() => setActiveTab('PRIVACY_POLICY')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'PRIVACY_POLICY' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="h-3.5 w-3.5 text-amber-400" />
            Privacy & Telemetry Rights
          </button>
        </div>
      </div>

      {activeTab === 'MANAGEMENT' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drivers.map((drv) => (
            <div key={drv.id} className="p-6 rounded-2xl glass-panel space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-lg text-white shadow-md">
                    {drv.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{drv.name}</h3>
                    <p className="text-xs text-slate-400">{drv.depot} • {drv.licenseClasses}</p>
                  </div>
                </div>
                <span className={`badge ${drv.status === 'ON_TRIP' ? 'badge-dispatched' : 'badge-active'}`}>
                  {drv.status.replace('_', ' ')}
                </span>
              </div>

              {/* License Details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">License No.</span>
                  <span className="font-semibold text-slate-200">{drv.licenseNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">License Expiry</span>
                  <span className="font-semibold text-emerald-400">{drv.licenseExpiry}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Medical Cert Expiry</span>
                  <span className="font-semibold text-slate-200">{drv.medicalCertExpiry}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Assignment</span>
                  <span className="font-semibold text-amber-300">{drv.currentTrip || 'Standing by in depot'}</span>
                </div>
              </div>

              {/* Scores */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Safety & Defensive Driving Score</span>
                  <span className="font-bold text-emerald-400">{drv.safetyRating} / 5.0</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(drv.safetyRating / 5) * 100}%` }} />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Fuel Efficiency Rating</span>
                  <span className="font-bold text-amber-400">{drv.efficiencyRating} / 5.0</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(drv.efficiencyRating / 5) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Driver Privacy Transparency Panel (Module 10 Requirement) */
        <div className="p-6 rounded-2xl glass-panel space-y-6 max-w-3xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Driver Privacy & Active Window Telemetry Safeguard</h3>
              <p className="text-xs text-slate-400">Explicit transparency statement for all Zimbabwean fleet drivers</p>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-300">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Strict Window-Scoped GPS Tracking Rule
              </h4>
              <p>
                MotaLink strictly enforces technical limits on location telemetry. Location pings are only accepted by the backend server when an assigned driver is actively inside an <strong>EN_ROUTE trip status window</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" /> Transparent Driver In-App Rights
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>Personal off-duty time, meal breaks, and resting hours are never tracked or stored.</li>
                <li>Drivers have full visibility in their tablet dashboard showing active location ping timestamps.</li>
                <li>Performance metrics evaluate route safety and fuel efficiency, but peers cannot view individual driver scorecards.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
