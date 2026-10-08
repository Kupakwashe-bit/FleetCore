'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Truck, User, ArrowRight, CheckCircle2, Clock, MapPin, RefreshCw, Plus } from 'lucide-react';
import { CorridorMap } from '@/components/CorridorMap';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Incident Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportVehicleId, setReportVehicleId] = useState('');
  const [reportDriverId, setReportDriverId] = useState('');
  const [reportType, setReportType] = useState('BREAKDOWN');
  const [reportSeverity, setReportSeverity] = useState('HIGH');
  const [reportLocation, setReportLocation] = useState('A1 Highway, Banket (Harare-Chirundu corridor)');
  const [reportDescription, setReportDescription] = useState('Engine overheating and alternator failure en route.');
  
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

  const fetchResources = async () => {
    try {
      const [vRes, dRes] = await Promise.all([fetch('/api/vehicles'), fetch('/api/drivers')]);
      const [vData, dData] = await Promise.all([vRes.json(), dRes.json()]);

      if (Array.isArray(vData) && vData.length > 0) {
        setVehicles(vData);
        setReportVehicleId(vData[0].id);
      }
      if (Array.isArray(dData) && dData.length > 0) {
        setDrivers(dData);
        setReportDriverId(dData[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchResources();
  }, []);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: reportVehicleId,
          driverId: reportDriverId,
          incidentType: reportType,
          severity: reportSeverity,
          locationName: reportLocation,
          description: reportDescription,
          reporterName: 'Control Room Dispatcher',
        }),
      });

      if (res.ok) {
        setIsReportModalOpen(false);
        fetchIncidents();
        alert('Incident ticket logged! Vehicle set to MAINTENANCE status and dispatch watch notified.');
      } else {
        alert('Error logging incident ticket');
      }
    } catch (err) {
      alert('Failed to connect to server');
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Incident & Escalation Control Room</h2>
          <p className="text-sm text-slate-400">Breakdown alerts, nearby vehicle rerouting & immutable ownership chain</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchResources();
              setIsReportModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-red-950/50 transition"
          >
            <AlertTriangle className="h-4 w-4" />
            Report Incident / Breakdown
          </button>
          <div className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
            <span>Live Watch</span>
          </div>
        </div>
      </div>

      {/* Zimbabwe National Logistics Corridor Map */}
      <CorridorMap />

      {/* Incidents List */}
      <div className="space-y-6">
        {incidents.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel text-center text-slate-400 text-sm">
            No active incidents reported. The entire fleet is operating normally.
          </div>
        ) : (
          incidents.map((inc) => {
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
          })
        )}
      </div>

      {/* Report Incident Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel border border-slate-700 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-bold text-white">Report Fleet Emergency / Incident</h3>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Affected Fleet Vehicle</label>
                  <select
                    value={reportVehicleId}
                    onChange={(e) => setReportVehicleId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-red-500"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} ({v.make} {v.model})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Reporting Driver</label>
                  <select
                    value={reportDriverId}
                    onChange={(e) => setReportDriverId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-red-500"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.user?.name} ({d.licenseClasses})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Incident Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-red-500"
                  >
                    <option value="BREAKDOWN">Vehicle Breakdown / Engine Trouble</option>
                    <option value="ACCIDENT">Traffic Collision / Accident</option>
                    <option value="CARGO_DAMAGE">Cargo Spillage / Damage</option>
                    <option value="FUEL_THEFT_SUSPECTED">Suspected Fuel Siphoning / Theft</option>
                    <option value="MEDICAL">Driver Medical Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Severity Level</label>
                  <select
                    value={reportSeverity}
                    onChange={(e) => setReportSeverity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-red-500"
                  >
                    <option value="CRITICAL">CRITICAL (Immediate Rescue Needed)</option>
                    <option value="HIGH">HIGH (Cargo Delayed / Vehicle Stalled)</option>
                    <option value="MEDIUM">MEDIUM (Minor Malfunction)</option>
                    <option value="LOW">LOW (Advisory Note)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Incident Location (Highway / Landmark)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A3 Highway (25km outside Marondera)"
                  value={reportLocation}
                  onChange={(e) => setReportLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Problem Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe failure symptoms, cargo condition, and immediate assistance required"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-1.5"
                >
                  Log Incident Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.registrationNumber}>
                      {v.registrationNumber} ({v.make} {v.model}) - Status: {v.status}
                    </option>
                  ))}
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
