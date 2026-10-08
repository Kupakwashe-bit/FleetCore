'use client';

import React, { useState, useEffect } from 'react';
import { FileCheck, AlertTriangle, Clock, Plus, ShieldCheck, FileText, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function CompliancePage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form States
  const [docType, setDocType] = useState('ZINARA_LICENSE');
  const [targetType, setTargetType] = useState<'VEHICLE' | 'DRIVER'>('VEHICLE');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('ZINARA Harare');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [costUSD, setCostUSD] = useState('120');
  const [notes, setNotes] = useState('');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/compliance');
      const data = await res.json();
      if (Array.isArray(data)) setDocs(data);
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
        setSelectedVehicleId(vData[0].id);
      }
      if (Array.isArray(dData) && dData.length > 0) {
        setDrivers(dData);
        setSelectedDriverId(dData[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDocs();
    fetchResources();
  }, []);

  const handleAddDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType,
          vehicleId: targetType === 'VEHICLE' ? selectedVehicleId : null,
          driverId: targetType === 'DRIVER' ? selectedDriverId : null,
          documentNumber,
          issuingAuthority,
          issueDate,
          expiryDate,
          costUSD,
          notes,
          status: new Date(expiryDate) < new Date() ? 'EXPIRED' : 'VALID',
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setDocumentNumber('');
        setNotes('');
        fetchDocs();
      } else {
        alert('Error saving compliance document');
      }
    } catch (err) {
      alert('Failed to connect to server');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Compliance & Regulatory Vault</h2>
          <p className="text-sm text-slate-400">ZINARA licensing, VID certificates, route permits & automated expiry tracking</p>
        </div>
        <button
          onClick={() => {
            fetchResources();
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition self-start sm:self-auto"
        >
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
                  <p className="text-xs text-slate-400">
                    Target: {d.vehicle ? `Vehicle ${d.vehicle.registrationNumber}` : d.driver ? `Driver ${d.driver.user?.name || d.driver.licenseNumber}` : 'Fleet Wide'}
                  </p>
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

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel border border-slate-700 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Record Compliance Document</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddDocSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Document Category</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ZINARA_LICENSE">ZINARA Vehicle License Disc</option>
                    <option value="VID_INSPECTION">VID Fitness Certificate (COF)</option>
                    <option value="INSURANCE_POLICY">Insurance Policy</option>
                    <option value="RADIO_LICENSE">Radio License</option>
                    <option value="ROUTE_PERMIT">Route Permit</option>
                    <option value="COF_CERTIFICATE">Certificate of Fitness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Document / Serial No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ZIN-2026-HRE-9941"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Association</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="targetType"
                      value="VEHICLE"
                      checked={targetType === 'VEHICLE'}
                      onChange={() => setTargetType('VEHICLE')}
                      className="accent-emerald-500"
                    />
                    <span className="text-slate-200">Vehicle Document</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="targetType"
                      value="DRIVER"
                      checked={targetType === 'DRIVER'}
                      onChange={() => setTargetType('DRIVER')}
                      className="accent-emerald-500"
                    />
                    <span className="text-slate-200">Driver Certification</span>
                  </label>
                </div>

                {targetType === 'VEHICLE' ? (
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} ({v.make} {v.model})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.user?.name} ({d.licenseNumber})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Issuing Authority</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ZINARA, VID, Old Mutual"
                    value={issuingAuthority}
                    onChange={(e) => setIssuingAuthority(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Renewal Cost (USD $)</label>
                  <input
                    type="number"
                    value={costUSD}
                    onChange={(e) => setCostUSD(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Expiry Deadline</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Regulatory Notes / Restrictions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Approved for Harare-Mutare freight corridor"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
                >
                  Save Compliance Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
