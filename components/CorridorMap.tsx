'use client';

import React from 'react';
import { MapPin, Navigation, AlertTriangle, Truck, Radio } from 'lucide-react';

interface CorridorMapProps {
  activeTrips?: any[];
  activeIncidents?: any[];
  selectedDepot?: string;
}

export const CorridorMap: React.FC<CorridorMapProps> = ({
  activeTrips = [],
  activeIncidents = [],
  selectedDepot = 'ALL',
}) => {
  // Major nodes in Zimbabwe
  const depots = [
    { code: 'HRE', name: 'Harare Central Hub', x: 55, y: 32, isDepot: true },
    { code: 'BYO', name: 'Bulawayo Freight Terminal', x: 28, y: 68, isDepot: true },
    { code: 'MTR', name: 'Mutare Border Station', x: 82, y: 46, isDepot: true },
    { code: 'GWU', name: 'Gweru Industrial Yard', x: 42, y: 52, isDepot: true },
    { code: 'MAS', name: 'Masvingo Hub', x: 58, y: 62, isDepot: true },
    { code: 'CHI', name: 'Chirundu Border', x: 42, y: 12, isDepot: false },
    { code: 'BEI', name: 'Beitbridge Border', x: 54, y: 92, isDepot: false },
  ];

  return (
    <div className="p-5 rounded-2xl glass-panel space-y-4 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Zimbabwe National Logistics Corridor Telemetry</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Live Highway Tracking
          </span>
          <span className="flex items-center gap-1 text-red-400 font-medium">
            <AlertTriangle className="h-3.5 w-3.5" /> Breakdown Alerts
          </span>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative w-full h-80 sm:h-96 rounded-xl bg-slate-950 border border-slate-900 overflow-hidden flex items-center justify-center">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <svg className="w-full h-full p-4" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Corridors / Highway Network */}
          {/* A1: Harare -> Chirundu */}
          <line x1="55" y1="32" x2="42" y2="12" stroke="#334155" strokeWidth="1.5" strokeDasharray="2,2" />
          {/* A3: Harare -> Mutare */}
          <line x1="55" y1="32" x2="82" y2="46" stroke="#059669" strokeWidth="2.5" />
          {/* A5: Harare -> Gweru -> Bulawayo */}
          <line x1="55" y1="32" x2="42" y2="52" stroke="#059669" strokeWidth="2" />
          <line x1="42" y1="52" x2="28" y2="68" stroke="#059669" strokeWidth="2" />
          {/* A4: Harare -> Masvingo -> Beitbridge */}
          <line x1="55" y1="32" x2="58" y2="62" stroke="#334155" strokeWidth="1.5" strokeDasharray="2,2" />
          <line x1="58" y1="62" x2="54" y2="92" stroke="#334155" strokeWidth="1.5" strokeDasharray="2,2" />
          {/* Gweru -> Masvingo link */}
          <line x1="42" y1="52" x2="58" y2="62" stroke="#1e293b" strokeWidth="1" strokeDasharray="1,1" />

          {/* Active Trip Position: Harare to Mutare (A3 Corridor outside Marondera) */}
          <g transform="translate(68, 39)">
            <circle r="4" fill="#10b981" opacity="0.3" className="animate-ping" />
            <circle r="2.5" fill="#10b981" />
            <text x="4" y="1" fill="#6ee7b7" fontSize="3" fontWeight="bold" fontFamily="sans-serif">
              AGE-4920 (En Route)
            </text>
          </g>

          {/* Breakdown Incident Marker on A3 Corridor */}
          <g transform="translate(64, 37)">
            <circle r="4" fill="#ef4444" opacity="0.4" className="animate-ping" />
            <polygon points="0,-3 3,2 -3,2" fill="#ef4444" />
            <text x="-12" y="-4" fill="#fca5a5" fontSize="2.8" fontWeight="bold" fontFamily="sans-serif">
              Breakdown: AGE-4920
            </text>
          </g>

          {/* Rescue Vehicle Marker */}
          <g transform="translate(45, 50)">
            <circle r="3" fill="#3b82f6" opacity="0.4" className="animate-pulse" />
            <circle r="2" fill="#3b82f6" />
            <text x="3" y="4" fill="#93c5fd" fontSize="2.8" fontWeight="bold" fontFamily="sans-serif">
              Rescue: BCE-9102
            </text>
          </g>

          {/* Regional Hub Nodes */}
          {depots.map((d) => (
            <g key={d.code} transform={`translate(${d.x}, ${d.y})`}>
              <circle
                r={d.isDepot ? 2.5 : 1.5}
                fill={d.isDepot ? '#10b981' : '#64748b'}
                stroke="#0b0f19"
                strokeWidth="0.8"
              />
              <text
                x={d.isDepot ? 3.5 : 2.5}
                y={d.isDepot ? 1 : 0.8}
                fill={d.isDepot ? '#ffffff' : '#94a3b8'}
                fontSize={d.isDepot ? 3.2 : 2.6}
                fontWeight={d.isDepot ? 'bold' : 'normal'}
                fontFamily="sans-serif"
              >
                {d.name.split(' ')[0]}
              </text>
            </g>
          ))}
        </svg>

        {/* Floating Telemetry Stats Badge */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl text-[11px] space-y-1">
          <div className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Radio className="h-3 w-3 text-emerald-400 animate-pulse" /> Active Corridor GPS Status
          </div>
          <p className="text-slate-200">
            A3 Highway: <span className="text-emerald-400 font-bold">Harare → Mutare</span> (76 km/h avg)
          </p>
          <p className="text-slate-400 text-[10px]">
            Privacy Window: Strictly active EN_ROUTE telemetry only
          </p>
        </div>
      </div>
    </div>
  );
};
