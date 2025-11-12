import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api } from '../../utils/api';

export const CreateContainerModal = ({ isOpen, onClose, imageId, imageName, onSuccess, showMessage }) => {
  const [name, setName] = useState('');
  const [ports, setPorts] = useState('');
  const [env, setEnv] = useState('');
  const [volumes, setVolumes] = useState('');

  const handleCreate = async () => {
    const portsArray = ports ? ports.split('\n').map(p => p.trim()).filter(p => p) : [];
    const envArray = [];
    if (env) {
      const envLines = env.split('\n').map(e => e.trim()).filter(e => e);
      envLines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          envArray.push({ key: key.trim(), value: valueParts.join('=').trim() });
        }
      });
    }

    const volumesArray = [];
    if (volumes) {
      const volumeLines = volumes.split('\n').map(v => v.trim()).filter(v => v);
      volumeLines.forEach(line => {
        const [host, container] = line.split(':');
        if (host && container) {
          volumesArray.push({ host: host.trim(), container: container.trim() });
        }
      });
    }

    try {
      await api.createContainer({
        image: imageName,
        name: name || undefined,
        ports: portsArray,
        env: envArray,
        volumes: volumesArray,
      });
      setName('');
      setPorts('');
      setEnv('');
      setVolumes('');
      onSuccess();
      onClose();
      showMessage('Success', 'Container created and started successfully!', 'success');
    } catch (error) {
      showMessage('Error', `Error creating container: ${error.message}`, 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Run Container">
      <div className="create-form">
        <div className="form-group">
          <label>Image:</label>
          <input type="text" value={imageName} readOnly />
        </div>

        <div className="form-group">
          <label>Container Name (optional):</label>
          <input
            type="text"
            placeholder="my-container"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Port Mappings (one per line):</label>
          <textarea
            placeholder="8080:80&#10;3000:3000"
            rows={3}
            value={ports}
            onChange={(e) => setPorts(e.target.value)}
          />
          <small>Format: host_port:container_port</small>
        </div>

        <div className="form-group">
          <label>Environment Variables (one per line):</label>
          <textarea
            placeholder="NODE_ENV=production&#10;PORT=3000"
            rows={3}
            value={env}
            onChange={(e) => setEnv(e.target.value)}
          />
          <small>Format: KEY=VALUE</small>
        </div>

        <div className="form-group">
          <label>Volume Mounts (one per line):</label>
          <textarea
            placeholder="/host/path:/container/path"
            rows={3}
            value={volumes}
            onChange={(e) => setVolumes(e.target.value)}
          />
          <small>Format: host_path:container_path</small>
        </div>

        <div className="form-actions">
          <Button onClick={handleCreate}>Create & Run</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
};
