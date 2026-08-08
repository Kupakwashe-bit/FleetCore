'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Plus, Filter, AlertOctagon, DollarSign, History, Shield, CheckCircle2, XCircle } from 'lucide-react';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [decommissionVehicle, setDecommissionVehicle] = useState<any | null>(null);

  // Form states
  const [newReg, setNewReg] = useState('');
  const [newVin, setNewVin] = useState('');
  const [newCategory, setNewCategory] = useState('HAULAGE_TRUCK');
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState('2023');
  const [newPayload, setNewPayload] = useState('25000');
  const [newDepotId, setNewDepotId] = useState('HRE-DEPOT');

  // Decommission form
  const [decomWorkflow, setDecomWorkflow] = useState<'DECOMMISSIONED' | 'RESOLD'>('RESOLD');
  const [decomReason, setDecomReason] = useState('');
  const [resalePrice, setResalePrice] = useState('4500');
  const [buyerName, setBuyerName] = useState('');
  const [decomNotes, setDecomNotes] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles?category=${filterCategory}&status=${filterStatus}`);
      const data = await res.json();
      if (Array.isArray(data)) setVehicles(data);
    } catch (e) {
      console.error('Failed to load vehicles:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [filterCategory, filterStatus]);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: newReg,
          vin: newVin,
          category: newCategory,
          make: newMake,
          model: newModel,
          year: newYear,
          payloadCapacityKg: newPayload,
          depotId: newDepotId,
        }),
      });
      if (res.ok) {
        setIsAddOpen(false);
        fetchVehicles();
      }
    } catch (e) {
      alert('Error creating vehicle');
    }
  };

  const handleDecommissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decommissionVehicle) return;
    try {
      const res = await fetch(`/api/vehicles/${decommissionVehicle.id}/decommission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowType: decomWorkflow,
          reason: decomReason,
          resalePriceUSD: resalePrice,
          buyerName: buyerName,
          notes: decomNotes,
        }),
      });
      if (res.ok) {
        setDecommissionVehicle(null);
        fetchVehicles();
      }
    } catch (e) {
      alert('Error submitting decommission workflow');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Vehicle Registry</h2>
          <p className="text-sm text-slate-400">Mixed fleet catalog & historical lifecycle management</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add New Vehicle
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl glass-panel text-xs">
        <Filter className="h-4 w-4 text-emerald-400" />
        <span className="font-semibold text-slate-300">Category Filter:</span>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-900 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="HAULAGE_TRUCK">Haulage Truck (30T+)</option>
          <option value="LORRY">Medium Lorry (10T)</option>
          <option value="BUS_TAXI">Bus Taxi (Commuter)</option>
          <option value="SMALL_VEHICLE">Small Delivery Vehicle</option>
          <option value="TRICYCLE">Cargo Tricycle (Tuk-Tuk)</option>
        </select>

        <span className="font-semibold text-slate-300 ml-2">Status Filter:</span>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-900 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DISPATCHED">En Route / Dispatched</option>
          <option value="MAINTENANCE">In Maintenance</option>
          <option value="DECOMMISSIONED">Decommissioned</option>
          <option value="RESOLD">Resold</option>
        </select>
      </div>

      {/* Vehicle Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => {
          const isArchived = v.status === 'DECOMMISSIONED' || v.status === 'RESOLD';
          return (
            <div
              key={v.id}
              className={`p-5 rounded-2xl glass-panel space-y-4 relative ${
                isArchived ? 'opacity-75 border-purple-900/40 bg-slate-950/80' : ''
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    {v.category.replace('_', ' ')}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{v.registrationNumber}</h3>
                  <p className="text-xs text-slate-400">{v.make} {v.model} ({v.year})</p>
                </div>
                <span className={`badge badge-${v.status.toLowerCase()}`}>
                  {v.status}
                </span>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block">Payload / Cap</span>
                  <span className="font-semibold text-slate-200">
                    {v.payloadCapacityKg > 0 ? `${v.payloadCapacityKg.toLocaleString()} kg` : `${v.passengerCapacity} seats`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Odometer</span>
                  <span className="font-semibold text-slate-200">{v.odometerKm.toLocaleString()} km</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Depot</span>
                  <span className="font-semibold text-slate-200">{v.depot?.name || v.depotId}</span>
                </div>
              </div>

              {/* Historical Archival Banner if Resold/Decommissioned */}
              {isArchived && (
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-purple-300">
                    <History className="h-3.5 w-3.5" />
                    <span>Preserved Historical Record</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Reason: {v.decommissionReason || 'Retired from fleet'}
                  </p>
                  {v.resalePriceUSD && (
                    <p className="text-emerald-400 font-semibold text-[11px]">
                      Resale Price: ${v.resalePriceUSD.toLocaleString()} USD ({v.buyerName})
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              {!isArchived && (
                <button
                  onClick={() => setDecommissionVehicle(v)}
                  className="w-full py-2 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-900/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <AlertOctagon className="h-3.5 w-3.5 text-amber-400" />
                  Decommission / Resale Workflow
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Decommission & Resale Modal */}
      {decommissionVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Decommission & Resale Workflow</h3>
              </div>
              <button onClick={() => setDecommissionVehicle(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Retiring <strong>{decommissionVehicle.registrationNumber}</strong> ({decommissionVehicle.make} {decommissionVehicle.model}).
              <br />
              <span className="text-emerald-400 font-semibold">
                Note: All historical trip logs, repair costs, and compliance records will be permanently preserved for auditing.
              </span>
            </p>

            <form onSubmit={handleDecommissionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Workflow Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="workflow"
                      value="RESOLD"
                      checked={decomWorkflow === 'RESOLD'}
                      onChange={() => setDecomWorkflow('RESOLD')}
                      className="accent-emerald-500"
                    />
                    <span className="text-slate-200">Resale to Third-Party Buyer</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="workflow"
                      value="DECOMMISSIONED"
                      checked={decomWorkflow === 'DECOMMISSIONED'}
                      onChange={() => setDecomWorkflow('DECOMMISSIONED')}
                      className="accent-emerald-500"
                    />
                    <span className="text-slate-200">Internal Decommission / Scrap</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Decommission Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engine wearout, replacement with new haulage truck"
                  value={decomReason}
                  onChange={(e) => setDecomReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {decomWorkflow === 'RESOLD' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Resale Price (USD $)</label>
                    <input
                      type="number"
                      required
                      value={resalePrice}
                      onChange={(e) => setResalePrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Buyer Entity / Individual</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Harare Salvage Ltd"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-medium mb-1">Notes / Audit Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Additional audit verification details"
                  value={decomNotes}
                  onChange={(e) => setDecomNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDecommissionVehicle(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
                >
                  Confirm Archival & Resale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
