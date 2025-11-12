const express = require('express');
const Docker = require('dockerode');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

app.use(cors());
app.use(express.json());

// Disable caching for development
app.use(express.static('public', {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

// Containers endpoints
app.get('/api/containers', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    res.json(containers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/containers/:id/start', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.start();
    res.json({ success: true, message: 'Container started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/containers/:id/stop', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.stop();
    res.json({ success: true, message: 'Container stopped' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/containers/:id/restart', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.restart();
    res.json({ success: true, message: 'Container restarted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/containers/:id', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.remove({ force: true });
    res.json({ success: true, message: 'Container removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/containers/:id/logs', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail: 100,
      timestamps: true
    });
    res.send(logs.toString('utf8'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/containers/:id/stats', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    const stats = await container.stats({ stream: false });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Images endpoints
app.get('/api/images', async (req, res) => {
  try {
    const images = await docker.listImages();
    const containers = await docker.listContainers({ all: true });

    // Count containers for each image
    const imagesWithContainerCount = images.map(image => {
      const containerCount = containers.filter(container => {
        return container.ImageID === image.Id || container.Image === image.RepoTags?.[0];
      }).length;

      return {
        ...image,
        ContainerCount: containerCount
      };
    });

    res.json(imagesWithContainerCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/images/:id', async (req, res) => {
  try {
    const image = docker.getImage(req.params.id);
    await image.remove({ force: true });
    res.json({ success: true, message: 'Image removed' });
  } catch (error) {
    // Check if error is related to containers using the image
    let errorMessage = error.message;

    if (error.statusCode === 409 || error.message.includes('conflict') ||
        error.message.includes('container') || error.message.includes('is using')) {
      errorMessage = 'Cannot delete this image because it has containers associated with it. Please remove all containers using this image first.';
    } else if (error.statusCode === 404) {
      errorMessage = 'Image not found.';
    }

    res.status(error.statusCode || 500).json({ error: errorMessage });
  }
});

app.post('/api/images/pull', async (req, res) => {
  try {
    const { imageName } = req.body;

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await docker.pull(imageName);

    // Track progress by layer
    const layerProgress = {};

    stream.on('data', (chunk) => {
      try {
        const data = JSON.parse(chunk.toString());

        // Send progress updates
        if (data.id) {
          layerProgress[data.id] = data;
        }

        // Send the update to client
        res.write(`data: ${JSON.stringify(data)}\n\n`);

      } catch (e) {
        console.error('Error parsing chunk:', e);
      }
    });

    stream.on('end', () => {
      res.write(`data: ${JSON.stringify({ status: 'complete', message: 'Image pulled successfully' })}\n\n`);
      res.end();
    });

    stream.on('error', (error) => {
      res.write(`data: ${JSON.stringify({ status: 'error', message: error.message })}\n\n`);
      res.end();
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/containers/create', async (req, res) => {
  try {
    const { image, name, ports, env, volumes } = req.body;

    // Build port bindings
    const portBindings = {};
    const exposedPorts = {};
    if (ports && ports.length > 0) {
      ports.forEach(port => {
        const [hostPort, containerPort] = port.split(':');
        const containerPortKey = `${containerPort}/tcp`;
        exposedPorts[containerPortKey] = {};
        portBindings[containerPortKey] = [{ HostPort: hostPort }];
      });
    }

    // Build environment variables
    const envArray = [];
    if (env && env.length > 0) {
      env.forEach(e => {
        if (e.key && e.value) {
          envArray.push(`${e.key}=${e.value}`);
        }
      });
    }

    // Build volume bindings
    const binds = [];
    if (volumes && volumes.length > 0) {
      volumes.forEach(vol => {
        if (vol.host && vol.container) {
          binds.push(`${vol.host}:${vol.container}`);
        }
      });
    }

    // Create container configuration
    const createOptions = {
      Image: image,
      name: name || undefined,
      Env: envArray.length > 0 ? envArray : undefined,
      ExposedPorts: Object.keys(exposedPorts).length > 0 ? exposedPorts : undefined,
      HostConfig: {
        PortBindings: Object.keys(portBindings).length > 0 ? portBindings : undefined,
        Binds: binds.length > 0 ? binds : undefined
      }
    };

    // Create and start the container
    const container = await docker.createContainer(createOptions);
    await container.start();

    res.json({ success: true, message: 'Container created and started', id: container.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Volumes endpoints
app.get('/api/volumes', async (req, res) => {
  try {
    const volumes = await docker.listVolumes();
    res.json(volumes.Volumes || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/volumes/create', async (req, res) => {
  try {
    const { name, driver, driverOpts, labels } = req.body;

    const createOptions = {
      Name: name || undefined,
      Driver: driver || 'local',
      DriverOpts: driverOpts || {},
      Labels: labels || {}
    };

    const volume = await docker.createVolume(createOptions);
    res.json({ success: true, message: 'Volume created successfully', volume });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/volumes/:name', async (req, res) => {
  try {
    const volume = docker.getVolume(req.params.name);
    await volume.remove();
    res.json({ success: true, message: 'Volume removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/volumes/:name/inspect', async (req, res) => {
  try {
    const volume = docker.getVolume(req.params.name);
    const info = await volume.inspect();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System info
app.get('/api/info', async (req, res) => {
  try {
    const info = await docker.info();
    res.json({
      ...info,
      DockerStatus: 'running'
    });
  } catch (error) {
    // Return a minimal response indicating Docker is not available
    res.json({
      DockerStatus: 'down',
      error: error.message,
      Containers: 0,
      ContainersRunning: 0,
      ContainersPaused: 0,
      ContainersStopped: 0,
      Images: 0
    });
  }
});

// Docker Events Stream
app.get('/api/events', async (req, res) => {
  try {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Get Docker event stream
    const stream = await docker.getEvents();

    // Send events to client
    stream.on('data', (chunk) => {
      try {
        const event = JSON.parse(chunk.toString());

        // Filter for relevant events
        if (event.Type === 'container' || event.Type === 'image' || event.Type === 'volume') {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }
      } catch (e) {
        console.error('Error parsing Docker event:', e);
      }
    });

    stream.on('error', (error) => {
      console.error('Docker events stream error:', error);
      res.end();
    });

    // Cleanup on client disconnect
    req.on('close', () => {
      stream.destroy();
    });

  } catch (error) {
    console.error('Error setting up Docker events stream:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/api/shell' });

// WebSocket handler for container shell
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const containerId = url.searchParams.get('container');

  if (!containerId) {
    ws.close(1008, 'Container ID required');
    return;
  }

  let exec;
  const container = docker.getContainer(containerId);

  // Create exec instance with interactive shell
  container.exec({
    Cmd: ['/bin/sh', '-c', 'if command -v bash >/dev/null 2>&1; then exec bash; else exec sh; fi'],
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true
  }, (err, execInstance) => {
    if (err) {
      ws.send(JSON.stringify({ error: err.message }));
      ws.close();
      return;
    }

    exec = execInstance;

    // Start the exec instance
    exec.start({ hijack: true, stdin: true, Tty: true }, (err, stream) => {
      if (err) {
        ws.send(JSON.stringify({ error: err.message }));
        ws.close();
        return;
      }

      // Send data from container to websocket
      stream.on('data', (chunk) => {
        try {
          ws.send(chunk.toString('utf8'));
        } catch (e) {
          console.error('Error sending to websocket:', e);
        }
      });

      stream.on('end', () => {
        ws.close();
      });

      // Send data from websocket to container
      ws.on('message', (msg) => {
        try {
          stream.write(msg);
        } catch (e) {
          console.error('Error writing to stream:', e);
        }
      });

      ws.on('close', () => {
        try {
          stream.end();
        } catch (e) {
          console.error('Error closing stream:', e);
        }
      });
    });
  });
});

server.listen(PORT, () => {
  console.log(`Docker UI running on http://localhost:${PORT}`);
});
