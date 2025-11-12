import { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../utils/api';

export const ComposeFileModal = ({ isOpen, onClose, project }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && project) {
      loadComposeFile();
    }
  }, [isOpen, project]);

  const loadComposeFile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getComposeFile(project);
      setContent(data.content);
    } catch (error) {
      setError(error.message);
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Docker Compose File - ${project}`} className="compose-file-modal">
      {loading && <div className="loading">Loading compose file...</div>}
      {error && <div className="error-message">Error: {error}</div>}
      {!loading && !error && (
        <pre className="compose-file-content">{content}</pre>
      )}
    </Modal>
  );
};
