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
    return name.includes(search.toLowerCase());
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

  if (filteredContainers.length === 0) {
    return <div className="loading">No containers match your search</div>;
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
          <div className="filters">
            <label>
              <input type="checkbox" defaultChecked />
              Show all
            </label>
          </div>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>
      {view === 'cards' ? (
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
