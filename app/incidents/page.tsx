'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Truck, User, ArrowRight, CheckCircle2, Clock, MapPin, RefreshCw } from 'lucide-react';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Reroute modal state
  const [rerouteIncident, setRerouteIncident] = useState<any | null>(null);
  const [selectedRescueVehicle, setSelectedRescueVehicle] = useState('BCE-9102');
  const [rerouteNotes, setRerouteNotes] = useState('');

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      if (Array.isArray(data)) setIncidents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleRerouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rerouteIncident) return;

    try {
      const res = await fetch(`/api/incidents/${rerouteIncident.id}/reroute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rescueVehicleReg: selectedRescueVehicle,
          actorName: 'Chipo Sibanda (Dispatcher)',
          notes: rerouteNotes || 'Assigned rescue vehicle & transshipment reroute.',
        }),
      });

      if (res.ok) {
        setRerouteIncident(null);
        fetchIncidents();
        alert('Rescue vehicle assigned and reroute recorded in incident ownership chain!');
      }
    } catch (err) {
      alert('Error updating incident reroute');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Incident & Escalation Control Room</h2>
          <p className="text-sm text-slate-400">Breakdown alerts, nearby vehicle rerouting & immutable ownership chain</p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
          <span>Real-time Dispatch Watch</span>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-6">
        {incidents.map((inc) => {
          const chain = JSON.parse(inc.ownershipChainJson || '[]');

          return (
            <div key={inc.id} className="p-6 rounded-2xl glass-panel space-y-4 border border-red-900/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider">{inc.severity} SEVERITY</span>
                      <span className="badge badge-maintenance">{inc.status.replace('_', ' ')}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {inc.incidentType} — {inc.vehicle?.registrationNumber} ({inc.vehicle?.make})
                    </h3>
                  </div>
                </div>

                {inc.status !== 'RESOLVED' && (
                  <button
                    onClick={() => setRerouteIncident(inc)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
                  >
                    <Truck className="h-4 w-4" />
                    Assign Rescue & Reroute Nearby Vehicle
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-500 block">Incident Location</span>
                    <span className="font-semibold text-slate-200 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-red-400" /> {inc.locationName}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-500 block">Problem Description</span>
                    <p className="text-slate-200 font-medium">{inc.description}</p>
                  </div>
                </div>

                {/* Ownership Chain */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-400" /> Immutable Escalation Ownership Chain
                  </h4>
                  <div className="space-y-2 border-l-2 border-slate-700 pl-3">
                    {chain.map((step: any, idx: number) => (
                      <div key={idx} className="space-y-0.5 relative">
                        <div className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-slate-500 block">{new Date(step.timestamp).toLocaleTimeString()}</span>
                        <span className="font-bold text-slate-300 block">{step.actor}</span>
                        <p className="text-slate-400 text-[11px]">{step.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reroute Rescue Modal */}
      {rerouteIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Assign Rescue & Reroute Transshipment</h3>
              <button onClick={() => setRerouteIncident(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Select an available nearby fleet vehicle to rescue cargo from <strong>{rerouteIncident.vehicle?.registrationNumber}</strong>.
            </p>

            <form onSubmit={handleRerouteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Available Nearby Rescue Vehicle</label>
                <select
                  value={selectedRescueVehicle}
                  onChange={(e) => setSelectedRescueVehicle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="BCE-9102">ISUZU 10-Ton Lorry (BCE-9102) - Gweru Yard (Available)</option>
                  <option value="AEL-8819">Nissan NP200 Delivery Bakkie (AEL-8819) - Mutare Depot (Available)</option>
                  <option value="TRC-0042">Bajaj Maxima Tricycle (TRC-0042) - Harare Depot (Available)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Escalation / Action Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Transship 10 tonnes fertilizer cargo to ISUZU Lorry for Mutare delivery"
                  value={rerouteNotes}
                  onChange={(e) => setRerouteNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRerouteIncident(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
                >
                  Confirm Reroute & Dispatch Rescue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
