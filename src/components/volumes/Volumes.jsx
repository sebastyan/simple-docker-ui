import { useState } from 'react';
import { useVolumes } from '../../hooks/useVolumes';
import { SearchBar } from '../common/SearchBar';
import { ViewToggle } from '../common/ViewToggle';
import { Button } from '../common/Button';
import { VolumeCard } from './VolumeCard';
import { VolumeList } from './VolumeList';
import { api } from '../../utils/api';

export const Volumes = ({ onCreateVolume, onInspect, onRefresh, showMessage, showConfirm }) => {
  const { volumes, loading, refresh } = useVolumes();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list');

  const filteredVolumes = volumes.filter((v) => {
    const name = v.Name.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const handleRemove = (name) => {
    showConfirm(
      'Confirm Removal',
      `Are you sure you want to remove volume "${name}"?`,
      async () => {
        try {
          await api.removeVolume(name);
          refresh();
          onRefresh();
        } catch (error) {
          showMessage('Error', `Error removing volume: ${error.message}`, 'error');
        }
      },
      'Remove',
      'danger'
    );
  };

  if (loading) {
    return <div className="loading">Loading volumes...</div>;
  }

  if (volumes.length === 0) {
    return <div className="loading">No volumes found</div>;
  }

  if (filteredVolumes.length === 0) {
    return <div className="loading">No volumes match your search</div>;
  }

  return (
    <div className="tab-content active">
      <div className="section-header">
        <h2>Volumes</h2>
        <div className="section-controls">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search volumes by name..."
          />
          <Button onClick={onCreateVolume}>Create Volume</Button>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>
      {view === 'cards' ? (
        <div className="cards-container">
          {filteredVolumes.map((volume) => (
            <VolumeCard
              key={volume.Name}
              volume={volume}
              onInspect={onInspect}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : (
        <VolumeList
          volumes={filteredVolumes}
          onInspect={onInspect}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
};
