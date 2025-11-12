const API_URL = '/api';

export const api = {
  // System info
  getSystemInfo: async () => {
    const response = await fetch(`${API_URL}/info`, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to fetch system info');
    return response.json();
  },

  // Containers
  getContainers: async () => {
    const response = await fetch(`${API_URL}/containers`, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to fetch containers');
    return response.json();
  },

  startContainer: async (id) => {
    const response = await fetch(`${API_URL}/containers/${id}/start`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to start container');
    return response.json();
  },

  stopContainer: async (id) => {
    const response = await fetch(`${API_URL}/containers/${id}/stop`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to stop container');
    return response.json();
  },

  restartContainer: async (id) => {
    const response = await fetch(`${API_URL}/containers/${id}/restart`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to restart container');
    return response.json();
  },

  removeContainer: async (id) => {
    const response = await fetch(`${API_URL}/containers/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to remove container');
    return response.json();
  },

  getContainerLogs: async (id) => {
    const response = await fetch(`${API_URL}/containers/${id}/logs`);
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.text();
  },

  getContainerStats: async (id) => {
    const response = await fetch(`${API_URL}/containers/${id}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  createContainer: async (config) => {
    const response = await fetch(`${API_URL}/containers/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create container');
    }
    return response.json();
  },

  // Images
  getImages: async () => {
    const response = await fetch(`${API_URL}/images`, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to fetch images');
    return response.json();
  },

  removeImage: async (id) => {
    const response = await fetch(`${API_URL}/images/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to remove image');
    return response.json();
  },

  pullImage: async (imageName) => {
    const response = await fetch(`${API_URL}/images/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageName }),
    });
    if (!response.ok) throw new Error('Failed to start image pull');
    return response;
  },

  // Volumes
  getVolumes: async () => {
    const response = await fetch(`${API_URL}/volumes`, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to fetch volumes');
    return response.json();
  },

  createVolume: async (config) => {
    const response = await fetch(`${API_URL}/volumes/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create volume');
    }
    return response.json();
  },

  removeVolume: async (name) => {
    const response = await fetch(`${API_URL}/volumes/${name}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to remove volume');
    return response.json();
  },

  inspectVolume: async (name) => {
    const response = await fetch(`${API_URL}/volumes/${name}/inspect`);
    if (!response.ok) throw new Error('Failed to inspect volume');
    return response.json();
  },
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
