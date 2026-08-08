'use client';

import React, { useState, useEffect } from 'react';
import { FileCheck, AlertTriangle, Clock, Plus, ShieldCheck, FileText, CheckCircle2, XCircle } from 'lucide-react';

export default function CompliancePage() {
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/compliance')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDocs(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Compliance & Regulatory Vault</h2>
          <p className="text-sm text-slate-400">ZINARA licensing, VID certificates, route permits & automated expiry tracking</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg transition">
          <Plus className="h-4 w-4" />
          Add Compliance Document
        </button>
      </div>

      {/* Regulatory Context Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 text-xs text-slate-300 space-y-1">
        <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
          <ShieldCheck className="h-4 w-4" /> Zimbabwean Regulatory Standard
        </h4>
        <p>
          Automated early warning system monitors ZINARA License Discs, VID Fitness Certificates (COF), Radio Licenses, Third-Party/Comprehensive Insurance, and Route Permits across all operational depots.
        </p>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((d) => {
          const isExpired = d.status === 'EXPIRED';
          const isExpiring = d.status === 'EXPIRING_SOON';

          return (
            <div
              key={d.id}
              className={`p-5 rounded-2xl glass-panel space-y-4 border ${
                isExpired
                  ? 'border-red-900/60 bg-red-950/20'
                  : isExpiring
                  ? 'border-amber-900/60 bg-amber-950/20'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    {d.docType.replace('_', ' ')}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{d.documentNumber}</h3>
                  <p className="text-xs text-slate-400">Target Vehicle: {d.vehicle?.registrationNumber || 'Fleet Wide'}</p>
                </div>
                <span className={`badge ${isExpired ? 'badge-expired' : isExpiring ? 'badge-expiring' : 'badge-active'}`}>
                  {d.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Issuing Authority</span>
                  <span className="font-semibold text-slate-200">{d.issuingAuthority}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Renewal Cost</span>
                  <span className="font-semibold text-emerald-400">${d.costUSD} USD</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Issue Date</span>
                  <span className="font-semibold text-slate-300">{new Date(d.issueDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Expiry Deadline</span>
                  <span className={`font-semibold ${isExpired ? 'text-red-400' : isExpiring ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {new Date(d.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {d.notes && (
                <p className="text-xs text-slate-400 italic">"{d.notes}"</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
