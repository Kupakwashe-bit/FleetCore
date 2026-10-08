'use client';

import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, DollarSign, AlertTriangle, CheckCircle2, Clock, Package, Plus, Filter, RefreshCw } from 'lucide-react';

export default function MaintenancePage() {
  const [serviceRecords, setServiceRecords] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  // Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form States
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [serviceType, setServiceType] = useState('PREVENTIVE');
  const [description, setDescription] = useState('');
  const [costUSD, setCostUSD] = useState('350');
  const [odometerAtService, setOdometerAtService] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendorName, setVendorName] = useState('Zim-Truck Diesel Services (Harare)');
  const [nextDueKm, setNextDueKm] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [returnToActive, setReturnToActive] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/maintenance?serviceType=${filterType}`);
      const data = await res.json();
      if (Array.isArray(data)) setServiceRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehicles');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setVehicles(data);
        if (!selectedVehicleId) setSelectedVehicleId(data[0].id);
        if (!odometerAtService) setOdometerAtService(data[0].odometerKm.toString());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchVehicles();
  }, [filterType]);

  const handleVehicleSelectChange = (vId: string) => {
    setSelectedVehicleId(vId);
    const v = vehicles.find((veh) => veh.id === vId);
    if (v) {
      setOdometerAtService(v.odometerKm.toString());
      setNextDueKm((v.odometerKm + 15000).toString());
    }
  };

  const handleLogServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicleId,
          serviceType,
          description,
          costUSD,
          odometerAtService,
          partsReplaced,
          serviceDate,
          vendorName,
          nextServiceDueKm: nextDueKm,
          nextServiceDueDate: nextDueDate,
          returnVehicleToActive: returnToActive,
        }),
      });

      if (res.ok) {
        setIsLogModalOpen(false);
        setDescription('');
        setPartsReplaced('');
        fetchRecords();
      } else {
        alert('Error saving service record');
      }
    } catch (e) {
      alert('Failed to connect to server');
    }
  };

  const totalSpend = serviceRecords.reduce((acc, curr) => acc + (curr.costUSD || 0), 0);
  const avgSpend = serviceRecords.length > 0 ? Math.round(totalSpend / serviceRecords.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Maintenance & Repair Management</h2>
          <p className="text-sm text-slate-400">Scheduled service reminders, preventive maintenance & parts cost history</p>
        </div>
        <button
          onClick={() => setIsLogModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition self-start sm:self-auto"
        >
          <Wrench className="h-4 w-4" />
          Log Service Record
        </button>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Logged Spend</span>
          <div className="text-2xl font-extrabold text-emerald-400">${totalSpend.toLocaleString()} USD</div>
        </div>
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <span className="text-xs text-slate-400 font-medium">Recorded Service Logs</span>
          <div className="text-2xl font-extrabold text-amber-400">{serviceRecords.length} Records</div>
        </div>
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <span className="text-xs text-slate-400 font-medium">Average Spend / Service</span>
          <div className="text-2xl font-extrabold text-slate-200">${avgSpend.toLocaleString()} USD</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 p-4 rounded-xl glass-panel text-xs">
        <Filter className="h-4 w-4 text-emerald-400" />
        <span className="font-semibold text-slate-300">Filter by Service Type:</span>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-900 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="ALL">All Maintenance Types</option>
          <option value="PREVENTIVE">Preventive Maintenance</option>
          <option value="REPAIR">General Repair</option>
          <option value="BREAKDOWN_REPAIR">Breakdown & Emergency Repair</option>
          <option value="INSPECTION">Inspection / Roadworthiness</option>
        </select>
      </div>

      {/* Records Table */}
      <div className="space-y-4">
        {serviceRecords.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel text-center text-slate-400 text-sm">
            No service records found. Log a new service record using the button above.
          </div>
        ) : (
          serviceRecords.map((rec) => (
            <div key={rec.id} className="p-5 rounded-2xl glass-panel space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {rec.vehicle?.registrationNumber} —{' '}
                      <span className="text-slate-300 font-normal">
                        {rec.vehicle?.make} {rec.vehicle?.model}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {rec.vendorName} • {new Date(rec.serviceDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-400">${rec.costUSD} USD</span>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">
                    {rec.serviceType.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-200">{rec.description}</p>

              {rec.partsReplaced && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                    <Package className="h-3.5 w-3.5" /> Replaced Parts Catalog:
                  </div>
                  <p className="text-slate-300">{rec.partsReplaced}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
                <span>
                  Odometer at Service: <strong>{rec.odometerAtService?.toLocaleString()} km</strong>
                </span>
                {rec.nextServiceDueKm && (
                  <span className="text-amber-400">
                    Next Service Due:{' '}
                    <strong>{rec.nextServiceDueKm.toLocaleString()} km</strong>{' '}
                    {rec.nextServiceDueDate && `(${new Date(rec.nextServiceDueDate).toLocaleDateString()})`}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Log Service Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel border border-slate-700 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Log Vehicle Service Record</h3>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleLogServiceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Fleet Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => handleVehicleSelectChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} ({v.make} {v.model}) - Status: {v.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Service Type</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PREVENTIVE">Preventive Maintenance</option>
                    <option value="BREAKDOWN_REPAIR">Breakdown Repair</option>
                    <option value="REPAIR">General Repair</option>
                    <option value="INSPECTION">Inspection / VID Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Total Cost (USD $)</label>
                  <input
                    type="number"
                    required
                    value={costUSD}
                    onChange={(e) => setCostUSD(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Odometer at Service (KM)</label>
                  <input
                    type="number"
                    required
                    value={odometerAtService}
                    onChange={(e) => setOdometerAtService(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Vendor / Workshop</label>
                  <input
                    type="text"
                    required
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Service Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. 150,000 km Scheduled Service: Oil, air filters, brake lining inspection"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Replaced Parts Catalog</label>
                <input
                  type="text"
                  placeholder="e.g. DAF Engine Oil Filter, Heavy Brake Lining, 15W40 Synthetic Oil"
                  value={partsReplaced}
                  onChange={(e) => setPartsReplaced(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Next Service Due (KM)</label>
                  <input
                    type="number"
                    placeholder="e.g. 165000"
                    value={nextDueKm}
                    onChange={(e) => setNextDueKm(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Next Service Due Date</label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={returnToActive}
                  onChange={(e) => setReturnToActive(e.target.checked)}
                  className="accent-emerald-500 h-4 w-4"
                />
                <span className="text-slate-300">Set vehicle status back to ACTIVE upon repair completion</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
                >
                  Save Service Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
