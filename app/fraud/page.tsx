'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle2, XCircle, FileText, Fuel, Gauge, Eye } from 'lucide-react';

export default function FraudPage() {
  const [alerts, setAlerts] = useState<any[]>([]);

  const fetchFraudAlerts = async () => {
    try {
      const res = await fetch('/api/fraud');
      const data = await res.json();
      if (Array.isArray(data)) setAlerts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFraudAlerts();
  }, []);

  const handleReviewAction = async (alertId: string, status: string) => {
    const reviewNotes = prompt(`Enter Auditor Resolution Notes for status: ${status}`);
    if (reviewNotes === null) return;

    try {
      const res = await fetch('/api/fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId,
          status,
          reviewNotes,
        }),
      });

      if (res.ok) {
        fetchFraudAlerts();
        alert('Auditor determination recorded successfully!');
      }
    } catch (e) {
      alert('Error updating audit review');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Fraud & Anomaly Review Center</h2>
          <p className="text-sm text-slate-400">Automated flag detection for fuel spikes, odometer gaps & route anomalies</p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-800/60 text-purple-300 text-xs font-bold flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-purple-400" />
          <span>Automated Compliance Rules Engine</span>
        </div>
      </div>

      {/* Flags List */}
      <div className="space-y-4">
        {alerts.map((al) => (
          <div key={al.id} className="p-6 rounded-2xl glass-panel space-y-4 border border-purple-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{al.anomalyType.replace('_', ' ')}</span>
                    <span className={`badge ${al.status === 'PENDING_REVIEW' ? 'badge-expiring' : 'badge-active'}`}>
                      {al.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Vehicle: {al.vehicle?.registrationNumber} ({al.vehicle?.make}) — Driver: {al.driver?.user?.name || 'Tendai Mutasa'}
                  </h3>
                </div>
              </div>

              {al.status === 'PENDING_REVIEW' && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => handleReviewAction(al.id, 'INVESTIGATED_VALIDATED')}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Validate Fraud
                  </button>
                  <button
                    onClick={() => handleReviewAction(al.id, 'FALSE_POSITIVE')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Dismiss False Positive
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 md:col-span-2 space-y-1">
                <span className="text-slate-500 block">Anomaly Rule Details</span>
                <p className="text-slate-200 font-medium">{al.details}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div>
                  <span className="text-slate-500 block">Category Baseline Expected</span>
                  <span className="font-bold text-emerald-400">{al.expectedValue || '36.0 L/100km'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Logged Actual Value</span>
                  <span className="font-bold text-purple-400">{al.actualValue || '54.2 L/100km'}</span>
                </div>
              </div>
            </div>

            {al.reviewNotes && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 space-y-1">
                <span className="font-bold text-purple-300 block">Auditor Resolution Record:</span>
                <p>"{al.reviewNotes}" — Reviewed by Auditor</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
