import { useEffect, useState } from 'react';
import { getServices } from '../services/apiService';
import { useOffline } from '../contexts/OfflineContext';

export const useServices = () => {
  const { isOnline, cacheRecords, getAll } = useOffline();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isOnline) {
          const remote = await getServices();
          if (!cancelled) {
            setServices(remote);
            await cacheRecords('services', remote);
          }
        } else {
          const cached = await getAll('services');
          if (!cancelled) {
            setServices(cached);
          }
        }
      } catch (err) {
        setError(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [isOnline, cacheRecords, getAll]);

  return { services, loading, error };
};
