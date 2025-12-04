# Architecture Overview

The IA Low-Cost Assistant is composed of two deployable units:

1. **Frontend (React + Vite PWA)**
   - Provides bilingual UI, offline cache, assistant chat, and navigation.
   - Uses IndexedDB (`idb`) to persist services, FAQs, feedback queue, and recent activity.
   - Registers a service worker (via `vite-plugin-pwa`) for offline support and asset caching.

2. **Backend (Express + SQLite)**
   - Exposes JSON APIs for services, feedback, knowledge base, and sync.
   - Stores authoritative data inside SQLite (`better-sqlite3`) with WAL journaling.
   - Handles authentication (JWT) and admin capabilities.

Communication happens through HTTPS fetch calls (`/api/*`). When offline, the frontend reads from IndexedDB and enqueues write operations for later sync.
