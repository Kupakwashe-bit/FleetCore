'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Users,
  Navigation,
  Wrench,
  FileCheck,
  AlertTriangle,
  ShieldAlert,
  History,
  Settings,
  Shield
} from 'lucide-react';

interface SidebarProps {
  currentRole: string;
  incidentCount?: number;
  complianceAlertCount?: number;
  fraudAlertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  incidentCount = 1,
  complianceAlertCount = 2,
  fraudAlertCount = 1,
}) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Fleet Overview', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'AUDITOR'] },
    { label: 'Vehicle Registry', href: '/vehicles', icon: Truck, roles: ['ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'AUDITOR'] },
    { label: 'Driver Management', href: '/drivers', icon: Users, roles: ['ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'DRIVER', 'AUDITOR'] },
    { label: 'Dispatch & Trips', href: '/trips', icon: Navigation, roles: ['ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'DRIVER'] },
    { label: 'Maintenance & Parts', href: '/maintenance', icon: Wrench, roles: ['ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'AUDITOR'] },
    { 
      label: 'Compliance Vault', 
      href: '/compliance', 
      icon: FileCheck, 
      roles: ['ADMIN', 'FLEET_MANAGER', 'AUDITOR'],
      badge: complianceAlertCount > 0 ? complianceAlertCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    { 
      label: 'Incident Escalation', 
      href: '/incidents', 
      icon: AlertTriangle, 
      roles: ['ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'DRIVER'],
      badge: incidentCount > 0 ? incidentCount : undefined,
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    { 
      label: 'Fraud & Anomaly', 
      href: '/fraud', 
      icon: ShieldAlert, 
      roles: ['ADMIN', 'FLEET_MANAGER', 'AUDITOR'],
      badge: fraudAlertCount > 0 ? fraudAlertCount : undefined,
      badgeColor: 'bg-purple-500 text-white',
    },
    { label: 'Audit Trail Logs', href: '/audit', icon: History, roles: ['ADMIN', 'FLEET_MANAGER', 'AUDITOR'] },
    { label: 'Backup & DR Manual', href: '/settings', icon: Settings, roles: ['ADMIN'] },
  ];

  return (
    <aside className="w-full md:w-64 border-r border-slate-800 bg-[#0b0f19] p-3 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Core Logistics Modules
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isAllowed = item.roles.includes(currentRole);
            if (!isAllowed) return null;

            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Driver Privacy Safeguard Banner for Drivers */}
      {currentRole === 'DRIVER' && (
        <div className="p-3 mt-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <Shield className="h-4 w-4" />
            <span>Driver Privacy Active</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            GPS tracking is strictly enabled <strong>only during active trip windows</strong>. Personal time telemetry is masked and unrecorded.
          </p>
        </div>
      )}
    </aside>
  );
};
