import { useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

export const TerminalModal = ({ isOpen, onClose, containerId, containerName }) => {
  const terminalRef = useRef(null);
  const terminalInstance = useRef(null);
  const socketRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    if (isOpen && containerId) {
      // Create terminal
      terminalInstance.current = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: '#000000',
          foreground: '#ffffff'
        },
        cols: 120,
        rows: 30
      });

      // Add fit addon
      fitAddonRef.current = new FitAddon();
      terminalInstance.current.loadAddon(fitAddonRef.current);

      // Open terminal in container
      terminalInstance.current.open(terminalRef.current);
      fitAddonRef.current.fit();

      // Connect WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/shell?container=${containerId}`;
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        terminalInstance.current.write('\r\n*** Connected to container shell ***\r\n\r\n');

        // Send data from terminal to websocket
        terminalInstance.current.onData((data) => {
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(data);
          }
        });
      };

      socketRef.current.onmessage = (event) => {
        if (terminalInstance.current) {
          terminalInstance.current.write(event.data);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        terminalInstance.current.write('\r\n*** Connection error ***\r\n');
      };

      socketRef.current.onclose = () => {
        if (terminalInstance.current) {
          terminalInstance.current.write('\r\n*** Connection closed ***\r\n');
        }
      };

      // Handle window resize
      const handleResize = () => {
        if (fitAddonRef.current && terminalInstance.current) {
          fitAddonRef.current.fit();
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (socketRef.current) {
          socketRef.current.close();
        }
        if (terminalInstance.current) {
          terminalInstance.current.dispose();
        }
      };
    }
  }, [isOpen, containerId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Shell - ${containerName}`}
      className="terminal-modal-content"
    >
      <div id="terminal-container" ref={terminalRef}></div>
    </Modal>
  );
};
