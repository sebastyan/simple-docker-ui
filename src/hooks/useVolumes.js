import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export const useVolumes = () => {
  const [volumes, setVolumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVolumes = useCallback(async () => {
    try {
      console.log('Fetching volumes...');
      setLoading(true);
      const data = await api.getVolumes();
      console.log('Volumes fetched:', data?.length || 0);
      // Create a new array to ensure React detects the change
      setVolumes([...(data || [])]);
      setError(null);
    } catch (err) {
      console.error('Error fetching volumes:', err);
      setError(err.message);
      setVolumes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVolumes();
  }, [fetchVolumes]);

  return { volumes, loading, error, refresh: fetchVolumes };
};
