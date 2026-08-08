'use client';

import React from 'react';
import { Wrench, Calendar, DollarSign, AlertTriangle, CheckCircle2, Clock, Package } from 'lucide-react';

export default function MaintenancePage() {
  const serviceRecords = [
    {
      id: 'srv-1',
      vehicleReg: 'AGE-4920',
      vehicleMake: 'DAF XF 105 Haulage',
      serviceType: 'PREVENTIVE',
      description: '140,000 km Scheduled Service: Oil, air filters, fuel injectors, brake lining check',
      costUSD: 650,
      odometerAtService: 140000,
      partsReplaced: 'DAF Synthetic Oil 15W40, Fuel Water Separator, Heavy Brake Pads',
      serviceDate: '2026-02-01',
      vendorName: 'Zim-Truck Diesel Services (Harare)',
      nextDueKm: 155000,
      nextDueDate: '2026-08-01',
    },
    {
      id: 'srv-2',
      vehicleReg: 'BCE-9102',
      vehicleMake: 'Isuzu FVR 900 Lorry',
      serviceType: 'BREAKDOWN_REPAIR',
      description: 'Radiator hose replacement & clutch plate adjustment',
      costUSD: 420,
      odometerAtService: 88500,
      partsReplaced: 'Reinforced Radiator Hose, Clutch Pressure Plate',
      serviceDate: '2026-01-15',
      vendorName: 'Gweru Industrial Auto Repairs',
      nextDueKm: 98000,
      nextDueDate: '2026-07-15',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Maintenance & Repair Management</h2>
          <p className="text-sm text-slate-400">Scheduled service reminders & complete parts cost history</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg transition">
          <Wrench className="h-4 w-4" />
          Log Service Record
        </button>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <span className="text-xs text-slate-400 font-medium">YTD Maintenance Spend</span>
          <div className="text-2xl font-extrabold text-emerald-400">$1,070 USD</div>
        </div>
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <span className="text-xs text-slate-400 font-medium">Upcoming Preventive Services</span>
          <div className="text-2xl font-extrabold text-amber-400">2 Vehicles</div>
        </div>
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <span className="text-xs text-slate-400 font-medium">Average Maintenance / Vehicle</span>
          <div className="text-2xl font-extrabold text-slate-200">$214 USD</div>
        </div>
      </div>

      {/* Records Table */}
      <div className="space-y-4">
        {serviceRecords.map((rec) => (
          <div key={rec.id} className="p-5 rounded-2xl glass-panel space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {rec.vehicleReg} — <span className="text-slate-300 font-normal">{rec.vehicleMake}</span>
                  </h3>
                  <p className="text-xs text-slate-400">{rec.vendorName} • {rec.serviceDate}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-400">${rec.costUSD} USD</span>
                <span className="block text-[10px] uppercase font-bold text-slate-500">{rec.serviceType.replace('_', ' ')}</span>
              </div>
            </div>

            <p className="text-xs text-slate-200">{rec.description}</p>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Package className="h-3.5 w-3.5" /> Replaced Parts Catalog:
              </div>
              <p className="text-slate-300">{rec.partsReplaced}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Odometer at Service: <strong>{rec.odometerAtService.toLocaleString()} km</strong></span>
              <span className="text-amber-400">Next Service Due: <strong>{rec.nextDueKm.toLocaleString()} km</strong> ({rec.nextDueDate})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
