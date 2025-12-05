import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { openDB } from 'idb';
import { syncQueuedPayloads } from '../services/syncService';

const OfflineContext = createContext();
const DB_NAME = 'ialowcost-cache';
const DB_VERSION = 1;

const initDatabase = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('services')) {
        db.createObjectStore('services', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('faqs')) {
        db.createObjectStore('faqs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('recentActivities')) {
        db.createObjectStore('recentActivities', { keyPath: 'timestamp' });
      }
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

const OfflineProvider = ({ children }) => {
  const [db, setDb] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    initDatabase().then(setDb);
  }, []);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (online && db) {
      setSyncing(true);
      syncQueuedPayloads(db).finally(() => setSyncing(false));
    }
  }, [online, db]);

  const cacheRecord = async (store, data) => {
    if (!db) return;
    const tx = db.transaction(store, 'readwrite');
    await tx.store.put(data);
    await tx.done;
  };

  const cacheRecords = async (store, list) => {
    if (!db) return;
    const tx = db.transaction(store, 'readwrite');
    await Promise.all(list.map((item) => tx.store.put(item)));
    await tx.done;
  };

  const getRecord = async (store, key) => {
    if (!db) return null;
    return db.get(store, key);
  };

  const getAll = async (store) => {
    if (!db) return [];
    return db.getAll(store);
  };

  const addRecentActivity = async (activity) => {
    if (!db) return;
    const tx = db.transaction('recentActivities', 'readwrite');
    await tx.store.put({ ...activity, timestamp: Date.now() });
    await tx.done;
  };

  const enqueuePayload = async (payload) => {
    if (!db) return;
    const tx = db.transaction('queue', 'readwrite');
    await tx.store.add({ payload, createdAt: Date.now() });
    await tx.done;
  };

  const value = useMemo(() => ({
    isOnline: online,
    isSyncing: syncing,
    cacheRecord,
    cacheRecords,
    getRecord,
    getAll,
    addRecentActivity,
    enqueuePayload,
  }), [online, syncing, db]);

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used inside OfflineProvider');
  }
  return context;
};

export { OfflineProvider, useOffline };
