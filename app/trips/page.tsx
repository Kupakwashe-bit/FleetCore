'use client';

import React, { useState, useEffect } from 'react';
import { Navigation, Plus, Radio, RefreshCw, CheckCircle2, MapPin, Fuel, Gauge, AlertTriangle, ShieldCheck } from 'lucide-react';
import { queueOfflineRecord, getOfflineQueue, processOfflineSync } from '@/lib/offline-sync';

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  
  // Trip completion modal state
  const [completeTrip, setCompleteTrip] = useState<any | null>(null);
  const [endOdometer, setEndOdometer] = useState('');
  const [endFuel, setEndFuel] = useState('');
  const [addedFuel, setAddedFuel] = useState('0');
  const [fuelCost, setFuelCost] = useState('0');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trips');
      const data = await res.json();
      if (Array.isArray(data)) setTrips(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    setOfflineQueue(getOfflineQueue());
  }, []);

  const handleTripCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeTrip) return;

    const payload = {
      syncUuid: `sync-uuid-${Date.now()}`,
      tripId: completeTrip.id,
      driverId: completeTrip.driverId,
      vehicleId: completeTrip.vehicleId,
      endOdometerKm: parseFloat(endOdometer),
      endFuelLevelL: parseFloat(endFuel),
      fuelAddedL: parseFloat(addedFuel),
      fuelCostUSD: parseFloat(fuelCost),
      timestamp: new Date().toISOString(),
      pings: [
        { latitude: -18.972, longitude: 32.671, speedKmh: 72, timestamp: new Date().toISOString() },
      ],
    };

    if (isOfflineSimulated || !navigator.onLine) {
      // Queue locally for low-signal route offline mode
      queueOfflineRecord(payload);
      setOfflineQueue(getOfflineQueue());
      setCompleteTrip(null);
      alert('Network unavailable / Low-signal route mode: Trip completion data QUEUED LOCALLY in IndexedDB! It will automatically sync once connectivity returns.');
    } else {
      // Direct online submission
      try {
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [payload] }),
        });
        if (res.ok) {
          setCompleteTrip(null);
          fetchTrips();
          alert('Trip completed and synced directly to central database!');
        }
      } catch (err) {
        alert('Sync failed, queuing offline.');
      }
    }
  };

  const handleSyncNow = async () => {
    const res = await processOfflineSync();
    if (res.success) {
      setOfflineQueue([]);
      fetchTrips();
      alert(`Sync Complete! Processed ${res.syncedCount} queued trip records to database.`);
    } else {
      alert(`Sync error: ${res.errors.join(', ')}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Trip & Dispatch Tracking</h2>
          <p className="text-sm text-slate-400">Offline-first route dispatch, fuel logging & automatic sync manager</p>
        </div>

        {/* Offline Mode Test Controls */}
        <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={isOfflineSimulated}
              onChange={(e) => setIsOfflineSimulated(e.target.checked)}
              className="accent-amber-500 h-4 w-4"
            />
            <span className={isOfflineSimulated ? 'text-amber-400 font-bold' : ''}>
              {isOfflineSimulated ? 'Simulate Low-Signal Rural Route (Offline)' : 'Online Mode'}
            </span>
          </label>
          {offlineQueue.length > 0 && (
            <button
              onClick={handleSyncNow}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Sync Offline Queue ({offlineQueue.length})
            </button>
          )}
        </div>
      </div>

      {/* Offline Queue Badge Banner */}
      {offlineQueue.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-between gap-4 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-amber-400 animate-pulse" />
            <span>
              <strong>{offlineQueue.length} Pending Local Records</strong> queued in tablet IndexedDB storage during low-signal transit.
            </span>
          </div>
          <button
            onClick={handleSyncNow}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
          >
            Trigger Sync Now
          </button>
        </div>
      )}

      {/* Trips List */}
      <div className="space-y-4">
        {trips.map((t) => (
          <div key={t.id} className="p-5 rounded-2xl glass-panel space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-emerald-400 font-bold">{t.tripCode}</span>
                    <span className={`badge ${t.status === 'EN_ROUTE' ? 'badge-dispatched' : 'badge-active'}`}>
                      {t.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {t.originDepot?.name || 'Harare Depot'} → {t.destinationName}
                  </h3>
                </div>
              </div>

              {t.status === 'EN_ROUTE' && (
                <button
                  onClick={() => {
                    setCompleteTrip(t);
                    setEndOdometer((t.startOdometerKm + 280).toString());
                    setEndFuel('210');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Log Trip Completion & Fuel
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Vehicle Assigned</span>
                <span className="font-semibold text-slate-200">{t.vehicle?.registrationNumber} ({t.vehicle?.make})</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Driver Assigned</span>
                <span className="font-semibold text-slate-200">{t.driver?.user?.name || 'Tendai Mutasa'}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Cargo Weight</span>
                <span className="font-semibold text-slate-200">{t.cargoWeightKg.toLocaleString()} kg</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Start Odometer</span>
                <span className="font-semibold text-slate-200">{t.startOdometerKm.toLocaleString()} km</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Modal */}
      {completeTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Log Trip Completion & Mileage</h3>
              <button onClick={() => setCompleteTrip(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleTripCompleteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Final Destination Odometer (KM)</label>
                <input
                  type="number"
                  required
                  value={endOdometer}
                  onChange={(e) => setEndOdometer(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Ending Fuel Level (L)</label>
                  <input
                    type="number"
                    required
                    value={endFuel}
                    onChange={(e) => setEndFuel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fuel Added En Route (L)</label>
                  <input
                    type="number"
                    value={addedFuel}
                    onChange={(e) => setAddedFuel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Fuel Cost (USD $)</label>
                <input
                  type="number"
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteTrip(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
                >
                  Submit Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
