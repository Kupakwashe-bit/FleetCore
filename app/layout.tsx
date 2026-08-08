'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { getOfflineQueue, processOfflineSync } from '@/lib/offline-sync';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentRole, setCurrentRole] = useState<string>('ADMIN');
  const [selectedDepot, setSelectedDepot] = useState<string>('ALL');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  useEffect(() => {
    // Monitor online/offline events
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    setIsOnline(navigator.onLine);

    // Read initial offline queue
    setPendingSyncCount(getOfflineQueue().length);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleManualSync = async () => {
    const res = await processOfflineSync();
    if (res.success) {
      setPendingSyncCount(0);
      alert(`Sync successful! Processed ${res.syncedCount} queued trip & fuel records to database.`);
    } else {
      alert(`Sync failed: ${res.errors.join(', ')}`);
    }
  };

  return (
    <html lang="en">
      <head>
        <title>MotaLink - Integrated Fleet & Logistics Management System</title>
        <meta name="description" content="Production-grade Zimbabwean Fleet & Logistics Management System" />
      </head>
      <body className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
        <Navbar
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          selectedDepot={selectedDepot}
          onDepotChange={setSelectedDepot}
          isOnline={isOnline}
          pendingSyncCount={pendingSyncCount}
          onManualSync={handleManualSync}
        />
        
        <div className="flex flex-1 max-w-7xl w-full mx-auto">
          <Sidebar currentRole={currentRole} />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
