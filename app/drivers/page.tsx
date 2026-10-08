'use client';

import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Award, Lock, Eye, Calendar, AlertCircle, Plus, CheckCircle2, RefreshCw } from 'lucide-react';

export default function DriversPage() {
  const [activeTab, setActiveTab] = useState<'MANAGEMENT' | 'PRIVACY_POLICY'>('MANAGEMENT');
  const [drivers, setDrivers] = useState<any[]>([]);
  const [depots, setDepots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Driver Form States
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newLicenseNumber, setNewLicenseNumber] = useState('');
  const [newLicenseClasses, setNewLicenseClasses] = useState('Class 1 Heavy, Class 2 Bus');
  const [newLicenseExpiry, setNewLicenseExpiry] = useState('2027-08-01');
  const [newMedicalExpiry, setNewMedicalExpiry] = useState('2027-02-01');
  const [newDepotId, setNewDepotId] = useState('');
  const [newSafetyRating, setNewSafetyRating] = useState('5.0');
  const [newEfficiencyRating, setNewEfficiencyRating] = useState('5.0');

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/drivers');
      const data = await res.json();
      if (Array.isArray(data)) setDrivers(data);
    } catch (e) {
      console.error('Failed to load drivers:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepots = async () => {
    try {
      const res = await fetch('/api/depots');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setDepots(data);
        if (!newDepotId) setNewDepotId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDrivers();
    fetchDepots();
  }, []);

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          licenseNumber: newLicenseNumber,
          licenseClasses: newLicenseClasses,
          licenseExpiry: newLicenseExpiry,
          medicalCertExpiry: newMedicalExpiry,
          depotId: newDepotId,
          safetyRating: newSafetyRating,
          efficiencyRating: newEfficiencyRating,
        }),
      });

      if (res.ok) {
        setIsAddOpen(false);
        // Reset form
        setNewName('');
        setNewEmail('');
        setNewLicenseNumber('');
        fetchDrivers();
      } else {
        const err = await res.json();
        alert(`Error creating driver: ${err.error}`);
      }
    } catch (e) {
      alert('Failed to connect to server');
    }
  };

  const handleStatusChange = async (driverId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/drivers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          status: newStatus,
        }),
      });
      if (res.ok) {
        fetchDrivers();
      }
    } catch (e) {
      alert('Failed to update driver status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Driver Hub & Performance</h2>
          <p className="text-sm text-slate-400">Licensing, certification, performance ratings & privacy compliance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
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

          {activeTab === 'MANAGEMENT' && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition"
            >
              <Plus className="h-4 w-4" />
              Onboard Driver
            </button>
          )}
        </div>
      </div>

      {activeTab === 'MANAGEMENT' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drivers.map((drv) => {
            const currentTrip = drv.trips && drv.trips.length > 0 ? drv.trips[0] : null;
            return (
              <div key={drv.id} className="p-6 rounded-2xl glass-panel space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-lg text-white shadow-md">
                      {drv.user?.name ? drv.user.name.split(' ').map((n: string) => n[0]).join('') : 'DR'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{drv.user?.name || 'Assigned Driver'}</h3>
                      <p className="text-xs text-slate-400">{drv.depot?.name || 'Depot'} • {drv.licenseClasses}</p>
                    </div>
                  </div>
                  
                  {/* Status Dropdown */}
                  <select
                    value={drv.status}
                    onChange={(e) => handleStatusChange(drv.id, e.target.value)}
                    className={`badge text-xs cursor-pointer font-bold focus:outline-none ${
                      drv.status === 'ON_TRIP'
                        ? 'badge-dispatched bg-blue-950 text-blue-300 border-blue-800'
                        : drv.status === 'AVAILABLE'
                        ? 'badge-active bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    <option value="AVAILABLE" className="bg-slate-900 text-white">AVAILABLE</option>
                    <option value="ON_TRIP" className="bg-slate-900 text-white">ON TRIP</option>
                    <option value="ON_LEAVE" className="bg-slate-900 text-white">ON LEAVE</option>
                    <option value="SUSPENDED" className="bg-slate-900 text-white">SUSPENDED</option>
                  </select>
                </div>

                {/* License Details */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">License No.</span>
                    <span className="font-semibold text-slate-200">{drv.licenseNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">License Expiry</span>
                    <span className="font-semibold text-emerald-400">
                      {new Date(drv.licenseExpiry).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Medical Cert Expiry</span>
                    <span className="font-semibold text-slate-200">
                      {new Date(drv.medicalCertExpiry).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Current Assignment</span>
                    <span className="font-semibold text-amber-300">
                      {currentTrip ? `${currentTrip.tripCode} (${currentTrip.destinationName})` : 'Standing by in depot'}
                    </span>
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
            );
          })}
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

      {/* Onboard Driver Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Onboard New Driver</h3>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Simbarashe Moyo"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="driver.simba@motalink.co.zw"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Driver License No.</label>
                  <input
                    type="text"
                    required
                    placeholder="ZIM-DL-109284"
                    value={newLicenseNumber}
                    onChange={(e) => setNewLicenseNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">License Classes</label>
                  <input
                    type="text"
                    required
                    placeholder="Class 1 Heavy, Class 2 Bus"
                    value={newLicenseClasses}
                    onChange={(e) => setNewLicenseClasses(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">License Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newLicenseExpiry}
                    onChange={(e) => setNewLicenseExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Medical Certificate Expiry</label>
                  <input
                    type="date"
                    required
                    value={newMedicalExpiry}
                    onChange={(e) => setNewMedicalExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Assigned Base Depot</label>
                <select
                  value={newDepotId}
                  onChange={(e) => setNewDepotId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {depots.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
                >
                  Save & Register Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
