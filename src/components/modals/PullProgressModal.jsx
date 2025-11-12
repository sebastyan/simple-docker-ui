import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../utils/api';

export const PullProgressModal = ({
  isOpen,
  onClose,
  imageName,
  activePull,
  onProgress,
  onComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && imageName && !isProcessing && (!activePull || activePull.status === 'pulling')) {
      setIsProcessing(true);
      pullImage();
    }
  }, [isOpen, imageName]);

  const pullImage = async () => {
    try {
      const response = await api.pullImage(imageName);

      if (!response.ok) {
        throw new Error('Failed to start image pull');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const layers = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.status === 'complete') {
                onProgress(imageName, layers, 'complete', 'Image pulled successfully!');
                onComplete(imageName);
                setIsProcessing(false);
              } else if (data.status === 'error') {
                onProgress(imageName, layers, 'error', data.message);
                setIsProcessing(false);
              } else if (data.id) {
                layers[data.id] = { ...layers[data.id], ...data };
                onProgress(imageName, { ...layers }, 'pulling', 'Pulling layers...');
              }
            } catch (e) {
              console.error('Error parsing progress:', e);
            }
          }
        }
      }
    } catch (error) {
      onProgress(imageName, {}, 'error', `Error pulling image: ${error.message}`);
      setIsProcessing(false);
    }
  };

  if (!activePull) {
    return null;
  }

  const renderLayers = () => {
    const layerIds = Object.keys(activePull.layers);
    if (layerIds.length === 0) {
      return <div className="pull-status">Initializing...</div>;
    }

    return layerIds.map(id => {
      const layer = activePull.layers[id];
      const layerStatus = layer.status || '';
      const progressDetail = layer.progressDetail || {};

      let progressPercent = 0;
      if (progressDetail.current && progressDetail.total) {
        progressPercent = (progressDetail.current / progressDetail.total) * 100;
      }

      return (
        <div key={id} className="pull-status">
          <div className="pull-status-header">{id}</div>
          <div className="pull-status-text">
            {layerStatus}{layer.progress ? ' ' + layer.progress : ''}
          </div>
          {progressPercent > 0 && (
            <div className="pull-progress-bar">
              <div className="pull-progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pulling: ${imageName}`}>
      <div className="pull-progress-container">
        {activePull.status === 'complete' ? (
          <div className="pull-complete">✓ {activePull.message}</div>
        ) : activePull.status === 'error' ? (
          <div className="pull-error">✗ {activePull.message}</div>
        ) : (
          renderLayers()
        )}
      </div>
    </Modal>
  );
};
