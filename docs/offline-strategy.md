# Offline & Sync Strategy

- **Assets & Shell**: Cached by Workbox (Stale-While-Revalidate) ensuring instant boot offline.
- **IndexedDB Stores**:
  - `services`, `faqs`, `recentActivities`, `queue`
- **Write Queue**: Mutations (feedback, new requests) are added to `queue` when offline. When the `online` event fires, `syncService` posts queued payloads to `/api/sync`.
- **Recent Activities**: Stored locally per device to keep the dashboard contextual.
- **Knowledge Base**: Bundled FAQ fallback for the assistant when inference or network fails.
