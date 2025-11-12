import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export const useImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getImages();
      // Create a new array to ensure React detects the change
      setImages([...data]);
      setError(null);
    } catch (err) {
      setError(err.message);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return { images, loading, error, refresh: fetchImages };
};
