import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../utils/api';

export const VolumeInspectModal = ({ isOpen, onClose, volumeName, showMessage }) => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && volumeName) {
      setLoading(true);
      api.inspectVolume(volumeName)
        .then(data => setInfo(data))
        .catch(err => {
          showMessage('Error', `Error loading volume details: ${err.message}`, 'error');
          onClose();
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, volumeName, showMessage, onClose]);

  if (!info || loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Volume Details">
        <div className="create-form">
          <div className="loading">Loading volume details...</div>
        </div>
      </Modal>
    );
  }

  const labels = info.Labels && Object.keys(info.Labels).length > 0
    ? Object.entries(info.Labels).map(([k, v]) => `${k}=${v}`).join('\n')
    : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Volume Details">
      <div className="create-form">
        <div className="form-group">
          <label>Name:</label>
          <input type="text" value={info.Name} readOnly />
        </div>
        <div className="form-group">
          <label>Driver:</label>
          <input type="text" value={info.Driver} readOnly />
        </div>
        <div className="form-group">
          <label>Mountpoint:</label>
          <input type="text" value={info.Mountpoint} readOnly />
        </div>
        <div className="form-group">
          <label>Created:</label>
          <input type="text" value={new Date(info.CreatedAt).toLocaleString()} readOnly />
        </div>
        <div className="form-group">
          <label>Scope:</label>
          <input type="text" value={info.Scope} readOnly />
        </div>
        {labels && (
          <div className="form-group">
            <label>Labels:</label>
            <textarea readOnly rows={3} value={labels} />
          </div>
        )}
      </div>
    </Modal>
  );
};
