import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export const useSystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      const data = await api.getSystemInfo();
      setSystemInfo(data);
      setError(null);
    } catch (err) {
      // Even if there's an error, set a default system info indicating Docker is down
      setSystemInfo({
        DockerStatus: 'down',
        Containers: 0,
        ContainersRunning: 0,
        Images: 0,
        error: err.message
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();
    const interval = setInterval(fetchSystemInfo, 10000);
    return () => clearInterval(interval);
  }, []);

  return { systemInfo, loading, error, refresh: fetchSystemInfo };
};
