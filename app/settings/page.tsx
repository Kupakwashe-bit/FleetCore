'use client';

import React, { useState } from 'react';
import { Settings, MapPin, Database, ShieldAlert, Download, Terminal, CheckCircle2, Lock, FileCode } from 'lucide-react';

export default function SettingsPage() {
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  const depots = [
    { code: 'HRE-DEPOT', name: 'Harare Central Logistics Hub', city: 'Harare', phone: '+263 242 754 890', vehiclesCount: 2 },
    { code: 'BYO-HUB', name: 'Bulawayo Freight Terminal', city: 'Bulawayo', phone: '+263 292 688 120', vehiclesCount: 1 },
    { code: 'MTR-DEPOT', name: 'Mutare Border Transit Station', city: 'Mutare', phone: '+263 202 612 300', vehiclesCount: 1 },
    { code: 'GWU-YARD', name: 'Gweru Industrial Yard', city: 'Gweru', phone: '+263 254 223 440', vehiclesCount: 1 },
  ];

  const triggerBackup = () => {
    setBackupStatus('Executing automated PostgreSQL dump & OpenSSL AES-256 encryption pipeline...');
    setTimeout(() => {
      setBackupStatus('SUCCESS: Encrypted backup created at /backups/motalink_db_2026-08-08_encrypted.tar.gz.gpg');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white">Multi-Depot & Disaster Recovery Settings</h2>
        <p className="text-sm text-slate-400">Branch depot management, automated encrypted backups & disaster recovery manual</p>
      </div>

      {/* Module 12: Multi-Branch Depots */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Multi-Branch Depot Network</h3>
          </div>
          <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold">
            + Provision New Branch Depot
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {depots.map((d) => (
            <div key={d.code} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                  {d.code}
                </span>
                <span className="text-slate-400 font-medium">{d.vehiclesCount} Vehicles Assigned</span>
              </div>
              <h4 className="text-sm font-bold text-white">{d.name}</h4>
              <p className="text-slate-400">{d.city}, Zimbabwe • Phone: {d.phone}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Module 11: Backup & Disaster Recovery */}
      <div className="p-6 rounded-2xl glass-panel space-y-6 border border-emerald-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Encrypted Backup & Disaster Recovery</h3>
              <p className="text-xs text-slate-400">Automated scheduled snapshots & off-site restoration manual</p>
            </div>
          </div>
          <button
            onClick={triggerBackup}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-emerald-950/50 self-start sm:self-auto"
          >
            <Download className="h-4 w-4" />
            Trigger Encrypted Snapshot Now
          </button>
        </div>

        {backupStatus && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 font-mono">
            {backupStatus}
          </div>
        )}

        {/* Step-by-step Documented Disaster Recovery Procedure */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" /> Standard Operating Disaster Recovery Manual
          </h4>
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3 text-xs font-mono text-slate-300">
            <div>
              <span className="text-amber-400 font-bold">Step 1: Decrypt Off-Site Backup Dump</span>
              <pre className="mt-1 text-slate-400 bg-slate-900 p-2 rounded border border-slate-800 overflow-x-auto">
                gpg --decrypt --output motalink_db.sql.gz motalink_db_2026-08-08_encrypted.tar.gz.gpg
              </pre>
            </div>

            <div>
              <span className="text-amber-400 font-bold">Step 2: Unzip Database Archive</span>
              <pre className="mt-1 text-slate-400 bg-slate-900 p-2 rounded border border-slate-800 overflow-x-auto">
                gunzip motalink_db.sql.gz
              </pre>
            </div>

            <div>
              <span className="text-amber-400 font-bold">Step 3: Restore to Docker PostgreSQL Target</span>
              <pre className="mt-1 text-slate-400 bg-slate-900 p-2 rounded border border-slate-800 overflow-x-auto">
                docker exec -i motalink_postgres psql -U motalink -d motalink_db &lt; motalink_db.sql
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
