import { useEffect, useRef } from 'react';

export const useDockerEvents = (callbacks) => {
  const callbacksRef = useRef(callbacks);

  // Update callbacks ref without triggering effect
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    let eventSource = null;
    let reconnectTimeout = null;

    const handleContainerEvent = (event) => {
      const { Action } = event;
      console.log('Container event:', Action);

      // Actions that should trigger container list refresh
      const containerActions = [
        'create', 'start', 'stop', 'restart', 'kill',
        'die', 'destroy', 'pause', 'unpause', 'rename'
      ];

      if (containerActions.includes(Action)) {
        callbacksRef.current.onContainerChange?.();
        callbacksRef.current.onSystemInfoChange?.();
      }
    };

    const handleImageEvent = (event) => {
      const { Action } = event;
      console.log('Image event:', Action);

      // Actions that should trigger image list refresh
      const imageActions = [
        'pull', 'push', 'delete', 'import', 'load',
        'save', 'tag', 'untag'
      ];

      if (imageActions.includes(Action)) {
        callbacksRef.current.onImageChange?.();
        callbacksRef.current.onSystemInfoChange?.();
      }
    };

    const handleVolumeEvent = (event) => {
      const { Action } = event;
      console.log('Volume event:', Action);

      // Actions that should trigger volume list refresh
      const volumeActions = ['create', 'mount', 'unmount', 'destroy'];

      if (volumeActions.includes(Action)) {
        callbacksRef.current.onVolumeChange?.();
        callbacksRef.current.onSystemInfoChange?.();
      }
    };

    const connectToEvents = () => {
      try {
        console.log('Connecting to Docker events stream...');

        // Create EventSource connection to Docker events stream
        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          console.log('Docker events stream connected');
        };

        eventSource.onmessage = (event) => {
          try {
            const dockerEvent = JSON.parse(event.data);
            console.log('Docker event received:', dockerEvent);

            // Handle different event types
            if (dockerEvent.Type === 'container') {
              handleContainerEvent(dockerEvent);
            } else if (dockerEvent.Type === 'image') {
              handleImageEvent(dockerEvent);
            } else if (dockerEvent.Type === 'volume') {
              handleVolumeEvent(dockerEvent);
            }
          } catch (err) {
            console.error('Error parsing Docker event:', err);
          }
        };

        eventSource.onerror = (error) => {
          console.error('EventSource error:', error);

          if (eventSource) {
            eventSource.close();
          }

          // Reconnect after 5 seconds
          console.log('Reconnecting to Docker events in 5 seconds...');
          reconnectTimeout = setTimeout(connectToEvents, 5000);
        };

      } catch (error) {
        console.error('Error connecting to Docker events:', error);
      }
    };

    // Start listening to events
    connectToEvents();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (eventSource) {
        console.log('Closing Docker events stream');
        eventSource.close();
      }
    };
  }, []); // Empty deps - only run once
};
