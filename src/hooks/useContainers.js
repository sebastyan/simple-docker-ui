import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export const useContainers = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContainers = useCallback(async () => {
    try {
      console.log('Fetching containers...');
      setLoading(true);
      const data = await api.getContainers();
      console.log('Containers fetched:', data.length);
      // Create a new array to ensure React detects the change
      setContainers([...data]);
      setError(null);
    } catch (err) {
      console.error('Error fetching containers:', err);
      setError(err.message);
      setContainers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  return { containers, loading, error, refresh: fetchContainers };
};
