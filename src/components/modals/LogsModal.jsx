import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../utils/api';

export const LogsModal = ({ isOpen, onClose, containerId }) => {
  const [logs, setLogs] = useState('Loading logs...');

  useEffect(() => {
    if (isOpen && containerId) {
      api.getContainerLogs(containerId)
        .then(data => setLogs(data || 'No logs available'))
        .catch(err => setLogs(`Error loading logs: ${err.message}`));
    }
  }, [isOpen, containerId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Container Logs">
      <pre id="logs-content">{logs}</pre>
    </Modal>
  );
};
