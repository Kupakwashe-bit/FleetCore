'use client';

import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, Search, Filter, User, Clock, Terminal } from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEntity, setFilterEntity] = useState('ALL');
  const [filterAction, setFilterAction] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/audit?entityName=${filterEntity}&action=${filterAction}`);
      const data = await res.json();
      if (Array.isArray(data)) setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterEntity, filterAction]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Immutable Audit Trail Explorer</h2>
          <p className="text-sm text-slate-400">Cryptographically immutable system change logs & state diffs</p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Write-Once Immutable Storage</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl glass-panel text-xs">
        <Filter className="h-4 w-4 text-emerald-400" />
        <span className="font-semibold text-slate-300">Entity:</span>
        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className="bg-slate-900 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="ALL">All Entities</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Trip">Trip</option>
          <option value="ComplianceDoc">Compliance Doc</option>
          <option value="Incident">Incident</option>
          <option value="FraudAlert">Fraud Alert</option>
        </select>

        <span className="font-semibold text-slate-300 ml-2">Action:</span>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-slate-900 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="ALL">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DECOMMISSION">DECOMMISSION</option>
          <option value="RESALE">RESALE</option>
          <option value="SYNC">SYNC</option>
          <option value="REROUTE">REROUTE</option>
        </select>
      </div>

      {/* Log Feed */}
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="p-4 rounded-xl glass-panel text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                  {log.action}
                </span>
                <span className="font-bold text-white">{log.entityName}</span>
                <span className="text-slate-500 font-mono text-[11px]">ID: {log.entityId}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3 text-amber-400" /> {log.userEmail} ({log.userRole})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-500" /> {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            {/* JSON State Diff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              {log.oldDataJson && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-900 space-y-1">
                  <span className="text-red-400 font-bold block">Previous State:</span>
                  <pre className="text-slate-400 overflow-x-auto whitespace-pre-wrap font-mono">
                    {JSON.stringify(JSON.parse(log.oldDataJson), null, 2)}
                  </pre>
                </div>
              )}
              {log.newDataJson && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-900 space-y-1">
                  <span className="text-emerald-400 font-bold block">New State:</span>
                  <pre className="text-emerald-300/90 overflow-x-auto whitespace-pre-wrap font-mono">
                    {JSON.stringify(JSON.parse(log.newDataJson), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
