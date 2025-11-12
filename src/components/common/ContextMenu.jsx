import { useState, useRef, useEffect } from 'react';

export const ContextMenu = ({ children, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 150; // minWidth from style
      const menuHeight = items.length * 45; // approximate height per item

      // Calculate position - align menu to the right of button
      let left = rect.left;
      let top = rect.bottom + 4;

      // Adjust if menu would go off right edge
      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 10;
      }

      // Adjust if menu would go off left edge
      if (left < 10) {
        left = 10;
      }

      // Adjust if menu would go off bottom edge
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 4;
      }

      // Adjust if menu would go off top edge
      if (top < 10) {
        top = 10;
      }

      setMenuPosition({ top, left });
    }
  }, [isOpen, items.length]);

  const handleItemClick = (item) => {
    item.onClick();
    setIsOpen(false);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
          opacity: 0.7,
          transition: 'opacity 0.2s',
          borderRadius: '4px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.background = 'var(--hover-bg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.7';
          e.currentTarget.style.background = 'none';
        }}
        title="More actions"
      >
        {children || '⋮'}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            background: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '150px',
            zIndex: 9999,
            overflow: 'hidden'
          }}
          className="context-menu-dropdown"
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                handleItemClick(item);
              }}
              disabled={item.disabled}
              style={{
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                color: item.variant === 'danger' ? '#ef4444' : '#1f2937',
                opacity: item.disabled ? 0.5 : 1,
                fontSize: '14px',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!item.disabled) {
                  e.currentTarget.style.background = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
