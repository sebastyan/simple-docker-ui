import { Modal } from './Modal';
import { Button } from './Button';

export const MessageModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="message-modal-content">
        <div className={`message-icon message-icon-${type}`}>
          {getIcon()}
        </div>
        <p className="message-text">{message}</p>
        <div className="form-actions">
          <Button onClick={onClose}>OK</Button>
        </div>
      </div>
    </Modal>
  );
};
