import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'primary' }) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="confirm-modal-content">
        <p className="confirm-message">{message}</p>
        <div className="form-actions">
          <Button variant={variant} onClick={handleConfirm}>
            {confirmText}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
