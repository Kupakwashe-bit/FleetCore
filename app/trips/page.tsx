'use client';

import React, { useState, useEffect } from 'react';
import { Navigation, Plus, Radio, RefreshCw, CheckCircle2, MapPin, Fuel, Gauge, AlertTriangle, ShieldCheck, Truck, User } from 'lucide-react';
import { queueOfflineRecord, getOfflineQueue, processOfflineSync } from '@/lib/offline-sync';
import { CorridorMap } from '@/components/CorridorMap';

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [depots, setDepots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  
  // Dispatch modal state
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [dispatchVehicleId, setDispatchVehicleId] = useState('');
  const [dispatchDriverId, setDispatchDriverId] = useState('');
  const [dispatchDepotId, setDispatchDepotId] = useState('');
  const [destinationName, setDestinationName] = useState('Forbes Border Post, Mutare');
  const [cargoDescription, setCargoDescription] = useState('Agricultural Fertilizer (Bagged)');
  const [cargoWeightKg, setCargoWeightKg] = useState('20000');
  const [passengerCount, setPassengerCount] = useState('0');
  const [startFuelLevel, setStartFuelLevel] = useState('300');

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

  const fetchResources = async () => {
    try {
      const [vRes, dRes, depRes] = await Promise.all([
        fetch('/api/vehicles?status=ACTIVE'),
        fetch('/api/drivers?status=AVAILABLE'),
        fetch('/api/depots'),
      ]);
      const [vData, dData, depData] = await Promise.all([vRes.json(), dRes.json(), depRes.json()]);

      if (Array.isArray(vData) && vData.length > 0) {
        setVehicles(vData);
        setDispatchVehicleId(vData[0].id);
      }
      if (Array.isArray(dData) && dData.length > 0) {
        setDrivers(dData);
        setDispatchDriverId(dData[0].id);
      }
      if (Array.isArray(depData) && depData.length > 0) {
        setDepots(depData);
        setDispatchDepotId(depData[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchResources();
    setOfflineQueue(getOfflineQueue());
  }, []);

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originDepotId: dispatchDepotId,
          destinationName,
          cargoDescription,
          cargoWeightKg,
          passengerCount,
          scheduledStart: new Date().toISOString(),
          vehicleId: dispatchVehicleId,
          driverId: dispatchDriverId,
          dispatcherUserId: 'dispatcher-system',
          startFuelLevelL: startFuelLevel,
        }),
      });

      if (res.ok) {
        setIsDispatchOpen(false);
        fetchTrips();
        fetchResources();
        alert('Trip dispatched successfully! Vehicle status updated to DISPATCHED and driver to ON_TRIP.');
      } else {
        const err = await res.json();
        alert(`Error dispatching trip: ${err.error}`);
      }
    } catch (err) {
      alert('Failed to connect to server');
    }
  };

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
          fetchResources();
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
      fetchResources();
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

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              fetchResources();
              setIsDispatchOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition"
          >
            <Plus className="h-4 w-4" />
            Dispatch New Trip
          </button>

          {/* Offline Mode Test Controls */}
          <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-300">
              <input
                type="checkbox"
                checked={isOfflineSimulated}
                onChange={(e) => setIsOfflineSimulated(e.target.checked)}
                className="accent-amber-500 h-4 w-4"
              />
              <span className={isOfflineSimulated ? 'text-amber-400 font-bold' : ''}>
                {isOfflineSimulated ? 'Low-Signal Offline Mode' : 'Online Mode'}
              </span>
            </label>
            {offlineQueue.length > 0 && (
              <button
                onClick={handleSyncNow}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Sync ({offlineQueue.length})
              </button>
            )}
          </div>
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

      {/* Zimbabwe National Logistics Corridor Map */}
      <CorridorMap />

      {/* Trips List */}
      <div className="space-y-4">
        {trips.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel text-center text-slate-400 text-sm">
            No active or scheduled trips found. Click "Dispatch New Trip" to create one.
          </div>
        ) : (
          trips.map((t) => (
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
                  <span className="font-semibold text-slate-200">
                    {t.vehicle?.registrationNumber} ({t.vehicle?.make})
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Driver Assigned</span>
                  <span className="font-semibold text-slate-200">
                    {t.driver?.user?.name || 'Assigned Driver'}
                  </span>
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
          ))
        )}
      </div>

      {/* Dispatch Trip Modal */}
      {isDispatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel border border-slate-700 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Dispatch New Route Trip</h3>
              </div>
              <button onClick={() => setIsDispatchOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Origin Base Depot</label>
                  <select
                    value={dispatchDepotId}
                    onChange={(e) => setDispatchDepotId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {depots.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.city})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Destination Name</label>
                  <input
                    type="text"
                    required
                    value={destinationName}
                    onChange={(e) => setDestinationName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Available Fleet Vehicle</label>
                  <select
                    value={dispatchVehicleId}
                    onChange={(e) => setDispatchVehicleId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {vehicles.length === 0 ? (
                      <option value="">No Active Vehicles Available</option>
                    ) : (
                      vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.registrationNumber} ({v.make} {v.model})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Assigned Driver</label>
                  <select
                    value={dispatchDriverId}
                    onChange={(e) => setDispatchDriverId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {drivers.length === 0 ? (
                      <option value="">No Available Drivers</option>
                    ) : (
                      drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.user?.name} ({d.licenseClasses})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Cargo / Goods Description</label>
                <input
                  type="text"
                  required
                  value={cargoDescription}
                  onChange={(e) => setCargoDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Cargo Weight (KG)</label>
                  <input
                    type="number"
                    required
                    value={cargoWeightKg}
                    onChange={(e) => setCargoWeightKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Passengers (if Bus)</label>
                  <input
                    type="number"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Initial Fuel Level (L)</label>
                  <input
                    type="number"
                    required
                    value={startFuelLevel}
                    onChange={(e) => setStartFuelLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDispatchOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
                >
                  Confirm & Dispatch Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
