# MotaLink - System Data Flow Architecture & Interactions

This document describes the architectural interaction between client devices, offline synchronization queues, backend micro-services, the fraud detection engine, compliance alerts, and the immutable audit log.

```mermaid
sequenceDiagram
    autonumber
    participant Mobile as Mobile/Tablet Client (Driver)
    participant IDB as Client IndexedDB Storage
    participant API as Next.js API (/api/sync)
    participant DB as PostgreSQL Database
    participant Fraud as Anomaly & Fraud Engine
    participant Audit as Immutable Audit Logger
    participant Control as Dispatch Control Room

    Note over Mobile,IDB: Low-Signal Rural Zimbabwean Route (Offline Mode)
    Mobile->>IDB: 1. Queue Trip Completion, Fuel & Mileage Record (syncUuid)
    Mobile->>IDB: 2. Queue Location Pings (Strictly EN_ROUTE window)
    
    Note over Mobile,API: Network Connectivity Restored
    IDB->>API: 3. POST /api/sync { items: [ queuedPayloads ] }
    
    API->>DB: 4. Update Trip Status (COMPLETED) & Vehicle Odometer
    API->>DB: 5. Store Location Pings (isOfflineCaptured: true)
    
    API->>Fraud: 6. Run Anomaly Detection (Fuel L/100km & Odometer Gap)
    alt Fraud Spike Detected (> 25% Baseline)
        Fraud->>DB: 7. Create FraudAlert (PENDING_REVIEW)
        Fraud->>Control: 8. Trigger Alert Banner in Fraud Watch Center
    end

    API->>Audit: 9. logAuditEvent(SYNC, Trip, oldData, newData)
    Audit->>DB: 10. Insert Immutable AuditLog Record
    API->>Mobile: 11. Return Sync Confirmation { success: true }
    Mobile->>IDB: 12. Clear Local Queue
```

---

## Key Data Flow Interactions

### 1. Offline-First Mobile Synchronization (Module 3 & 7)
- **Local Queuing**: When a driver operates in remote or low-signal Zimbabwean routes (e.g. Forbes Border, Chiredzi, Nyamapanda), trip updates, fuel fills, and telemetry pings are written to IndexedDB with a unique `syncUuid`.
- **Sync Processor**: Upon network restoration, the client issues a single atomic batch payload to `/api/sync`.
- **Anomaly Detection Integration**: As part of the sync pipeline, `/api/sync` invokes `runAnomalyDetection()`. If logged fuel consumption exceeds the category baseline by > 25% (e.g., DAF Haulage truck logging 54.2 L/100km vs 36.0 L/100km baseline), a `FraudAlert` record is automatically generated for auditor review.

### 2. Decommissioning & Resale Archival Flow (Module 1 & 8)
- **State Transition**: When a vehicle leaves the fleet (due to high maintenance costs or resale), its status is updated to `DECOMMISSIONED` or `RESOLD`.
- **Data Integrity**: Historical trips, service records, parts costs, and compliance records remain fully linked and intact for future auditing.
- **Audit Logging**: A `DECOMMISSION` or `RESALE` audit event is written to `AuditLog` storing the resale price, buyer name, and decommission reason.

### 3. Incident Escalation & Rescue Rerouting (Module 6 & 8)
- **Alert Dispatch**: A breakdown or accident alert generates an `Incident` ticket.
- **Rescue Matcher**: Dispatchers select an available nearby vehicle from the registry and assign it as `rescueVehicleId`.
- **Ownership Chain**: The action appends an entry to `ownershipChainJson` (recording timestamp, actor, and action), creating an unalterable history from initial breakdown report to cargo transshipment and final resolution.

### 4. Driver Privacy Boundary (Module 10)
- **Scoped Telemetry**: `LocationPing` entries are rejected unless `trip.status === 'EN_ROUTE'`. Personal off-duty time is never recorded or stored.
