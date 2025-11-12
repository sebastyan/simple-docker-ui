import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api, formatBytes } from '../../utils/api';

export const StatsModal = ({ isOpen, onClose, containerId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && containerId) {
      setLoading(true);
      api.getContainerStats(containerId)
        .then(data => {
          setStats(data);
          setError(null);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [isOpen, containerId]);

  if (!stats || loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Container Stats">
        <div id="stats-content">
          <div className="loading">Loading stats...</div>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Container Stats">
        <div id="stats-content">
          <div className="loading">Error loading stats: {error}</div>
        </div>
      </Modal>
    );
  }

  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
  const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
  const cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100;

  const memUsage = stats.memory_stats.usage;
  const memLimit = stats.memory_stats.limit;
  const memPercent = (memUsage / memLimit) * 100;

  const netInput = stats.networks?.eth0?.rx_bytes || 0;
  const netOutput = stats.networks?.eth0?.tx_bytes || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Container Stats">
      <div id="stats-content">
        <div className="stat-item">
          <div className="stat-label">CPU Usage</div>
          <div className="stat-value">{cpuPercent.toFixed(2)}%</div>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: `${Math.min(cpuPercent, 100)}%` }}></div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Memory Usage</div>
          <div className="stat-value">
            {formatBytes(memUsage)} / {formatBytes(memLimit)} ({memPercent.toFixed(2)}%)
          </div>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: `${memPercent}%` }}></div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Network I/O</div>
          <div className="stat-value">
            In: {formatBytes(netInput)} / Out: {formatBytes(netOutput)}
          </div>
        </div>
      </div>
    </Modal>
  );
};
