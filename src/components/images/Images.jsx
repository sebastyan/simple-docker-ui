import { useState } from 'react';
import { useImages } from '../../hooks/useImages';
import { SearchBar } from '../common/SearchBar';
import { ViewToggle } from '../common/ViewToggle';
import { Button } from '../common/Button';
import { ImageCard } from './ImageCard';
import { ImageList } from './ImageList';
import { api } from '../../utils/api';

export const Images = ({ onRun, onPullImage, onRefresh, activePulls = [], onOpenPullProgress, showMessage, showConfirm }) => {
  const { images, loading, refresh } = useImages();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list');
  const [imageName, setImageName] = useState('');

  const filteredImages = images.filter((img) => {
    const tags = img.RepoTags ? img.RepoTags.join(', ').toLowerCase() : '<none>';
    return tags.includes(search.toLowerCase());
  });

  const handleRemove = (id) => {
    showConfirm(
      'Confirm Removal',
      'Are you sure you want to remove this image?',
      async () => {
        try {
          await api.removeImage(id);
          refresh();
          onRefresh();
        } catch (error) {
          showMessage('Error', `Error removing image: ${error.message}`, 'error');
        }
      },
      'Remove',
      'danger'
    );
  };

  const handlePull = () => {
    if (!imageName.trim()) {
      showMessage('Validation Error', 'Please enter an image name', 'warning');
      return;
    }
    onPullImage(imageName);
    setImageName('');
  };

  if (loading) {
    return <div className="loading">Loading images...</div>;
  }

  if (images.length === 0) {
    return <div className="loading">No images found</div>;
  }

  if (filteredImages.length === 0) {
    return <div className="loading">No images match your search</div>;
  }

  return (
    <div className="tab-content active">
      <div className="section-header">
        <h2>Images</h2>
        <div className="section-controls">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search images by name..."
          />
          <div className="pull-image">
            <input
              type="text"
              id="image-name"
              placeholder="Enter image name (e.g., nginx:latest)"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
            />
            <button onClick={handlePull}>Pull Image</button>
          </div>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {activePulls.length > 0 && (
        <div className="active-pulls-container">
          {activePulls.map((pull) => (
            <div
              key={pull.imageName}
              className="active-pull-card"
              onClick={() => onOpenPullProgress(pull.imageName)}
            >
              <div className="active-pull-header">
                <span className="active-pull-name">{pull.imageName}</span>
                <span className={`active-pull-status status-${pull.status}`}>
                  {pull.status === 'pulling' ? 'Pulling...' :
                   pull.status === 'complete' ? 'Complete ✓' :
                   'Error ✗'}
                </span>
              </div>
              <div className="active-pull-message">{pull.message}</div>
              {pull.status === 'pulling' && (
                <div className="active-pull-progress">
                  <div className="active-pull-layers">
                    {Object.keys(pull.layers).length} layer(s)
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {view === 'cards' ? (
        <div className="cards-container">
          {filteredImages.map((image) => (
            <ImageCard
              key={image.Id}
              image={image}
              onRun={onRun}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : (
        <ImageList
          images={filteredImages}
          onRun={onRun}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
};
