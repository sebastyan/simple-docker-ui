import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api } from '../../utils/api';

export const CreateVolumeModal = ({ isOpen, onClose, onSuccess, showMessage }) => {
  const [name, setName] = useState('');
  const [driver, setDriver] = useState('local');

  const handleCreate = async () => {
    try {
      await api.createVolume({
        name: name || undefined,
        driver: driver || 'local',
      });
      setName('');
      setDriver('local');
      onSuccess();
      onClose();
      showMessage('Success', 'Volume created successfully!', 'success');
    } catch (error) {
      showMessage('Error', `Error creating volume: ${error.message}`, 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Volume">
      <div className="create-form">
        <div className="form-group">
          <label>Volume Name (optional):</label>
          <input
            type="text"
            placeholder="my-volume"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <small>Leave empty for auto-generated name</small>
        </div>

        <div className="form-group">
          <label>Driver:</label>
          <input
            type="text"
            value={driver}
            onChange={(e) => setDriver(e.target.value)}
          />
          <small>Default: local</small>
        </div>

        <div className="form-actions">
          <Button onClick={handleCreate}>Create Volume</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
};
