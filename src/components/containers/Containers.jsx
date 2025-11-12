import { useState, useEffect } from 'react';
import { useContainers } from '../../hooks/useContainers';
import { SearchBar } from '../common/SearchBar';
import { ViewToggle } from '../common/ViewToggle';
import { ContainerCard } from './ContainerCard';
import { ContainerList } from './ContainerList';
import { api } from '../../utils/api';

export const Containers = ({
  onLogs,
  onStats,
  onShell,
  onRefresh,
  showMessage,
  showConfirm,
}) => {
  const { containers, loading, refresh } = useContainers();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list');
  const [statusFilter, setStatusFilter] = useState('all');

  // Debug: Log whenever containers changes
  useEffect(() => {
    console.log('[Containers] Containers changed:', {
      count: containers.length,
      loading,
      containersArrayRef: containers,
      containers: containers.map(c => ({
        id: c.Id.substring(0, 12),
        name: c.Names[0],
        state: c.State
      }))
    });
  }, [containers, loading]);

  const filteredContainers = containers.filter((c) => {
    const name = c.Names[0].replace('/', '').toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'running') return matchesSearch && c.State === 'running';
    if (statusFilter === 'stopped') return matchesSearch && (c.State === 'exited' || c.State === 'created');
    if (statusFilter === 'paused') return matchesSearch && c.State === 'paused';

    return matchesSearch;
  });

  console.log('[Containers] Filtered:', filteredContainers.length, 'containers');

  const handleStart = async (id) => {
    try {
      await api.startContainer(id);
      refresh();
      onRefresh();
    } catch (error) {
      showMessage('Error', `Error starting container: ${error.message}`, 'error');
    }
  };

  const handleStop = async (id) => {
    try {
      await api.stopContainer(id);
      refresh();
      onRefresh();
    } catch (error) {
      showMessage('Error', `Error stopping container: ${error.message}`, 'error');
    }
  };

  const handleRestart = async (id) => {
    try {
      await api.restartContainer(id);
      refresh();
    } catch (error) {
      showMessage('Error', `Error restarting container: ${error.message}`, 'error');
    }
  };

  const handleRemove = (id) => {
    showConfirm(
      'Confirm Removal',
      'Are you sure you want to remove this container?',
      async () => {
        try {
          await api.removeContainer(id);
          refresh();
          onRefresh();
        } catch (error) {
          showMessage('Error', `Error removing container: ${error.message}`, 'error');
        }
      },
      'Remove',
      'danger'
    );
  };

  if (loading) {
    return <div className="loading">Loading containers...</div>;
  }

  if (containers.length === 0) {
    return <div className="loading">No containers found</div>;
  }

  const containerProps = {
    onStart: handleStart,
    onStop: handleStop,
    onRestart: handleRestart,
    onRemove: handleRemove,
    onLogs,
    onStats,
    onShell,
  };

  let emptyMessage = null;
  if (filteredContainers.length === 0) {
    if (search && statusFilter !== 'all') {
      emptyMessage = `No ${statusFilter} containers match your search`;
    } else if (search) {
      emptyMessage = 'No containers match your search';
    } else if (statusFilter !== 'all') {
      emptyMessage = `No ${statusFilter} containers found`;
    }
  }

  return (
    <div className="tab-content active">
      <div className="section-header">
        <h2>Containers</h2>
        <div className="section-controls">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search containers by name..."
          />
          <div className="status-filters">
            <button
              className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${statusFilter === 'running' ? 'active' : ''}`}
              onClick={() => setStatusFilter('running')}
            >
              Running
            </button>
            <button
              className={`filter-btn ${statusFilter === 'stopped' ? 'active' : ''}`}
              onClick={() => setStatusFilter('stopped')}
            >
              Stopped
            </button>
            <button
              className={`filter-btn ${statusFilter === 'paused' ? 'active' : ''}`}
              onClick={() => setStatusFilter('paused')}
            >
              Paused
            </button>
          </div>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>
      {emptyMessage ? (
        <div className="loading">{emptyMessage}</div>
      ) : view === 'cards' ? (
        <div className="cards-container">
          {filteredContainers.map((container) => (
            <ContainerCard
              key={container.Id}
              container={container}
              {...containerProps}
            />
          ))}
        </div>
      ) : (
        <ContainerList containers={filteredContainers} {...containerProps} />
      )}
    </div>
  );
};
