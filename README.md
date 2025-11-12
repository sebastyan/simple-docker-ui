# Docker UI

A modern, web-based Docker management interface built with React. Monitor and manage your Docker containers, images, and volumes through an intuitive dashboard with real-time updates.

## Features

### Container Management
- View all containers (running and stopped) in list or card view
- Start, stop, restart, and remove containers
- View real-time container logs with streaming support
- Monitor container stats (CPU, Memory, Network, I/O)
- Interactive terminal access via WebSocket
- Real-time container state updates via Server-Sent Events (SSE)

### Image Management
- List all Docker images with metadata
- Pull images from Docker Hub with real-time progress tracking
- View pull progress with layer-by-layer status
- Run containers directly from images
- Remove unused images
- Container count per image

### Volume Management
- List all Docker volumes
- Create new volumes with custom drivers and options
- Inspect volume details and metadata
- Remove volumes with confirmation
- View volume mount points and usage

### Real-time Monitoring
- Auto-refresh via Docker Events API
- Live container state updates
- Real-time pull progress tracking
- System-wide Docker statistics
- WebSocket-based interactive terminals

### User Interface
- Modern, responsive design with dark/light theme support
- List and card view modes for all resources
- Search and filter functionality
- Confirmation dialogs for destructive operations
- Modal-based workflows for logs, stats, and terminal access
- Real-time progress indicators

## Prerequisites

- Linux system with Docker installed
- Node.js (v14 or higher)
- Docker socket access at `/var/run/docker.sock`

## Installation

### Method 1: Development Mode

1. Clone the repository:
```bash
git clone <repository-url>
cd docker-ui
```

2. Install dependencies:
```bash
npm install
```

3. Start both backend and frontend servers:
```bash
# Terminal 1 - Start the backend API server
npm run server

# Terminal 2 - Start the frontend dev server
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Method 2: Production Build

1. Build the frontend:
```bash
npm run build
```

2. Serve the built frontend with the backend:
```bash
npm run server
```

3. Access the UI at:
```
http://localhost:3000
```

## Development Scripts

- `npm run server` - Start the Express backend server (port 3000)
- `npm run server:dev` - Start backend with nodemon for auto-reload
- `npm run dev` - Start Vite dev server with HMR (port 5173)
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build locally

## Usage

### Containers
- **List View**: Compact table view with all container details
- **Card View**: Visual cards with container information
- **Actions**: Start, Stop, Restart, Remove, Logs, Stats, Terminal
- **Terminal**: Click the terminal icon to open an interactive shell (bash/sh)
- **Logs**: Real-time log streaming with timestamps
- **Stats**: Live CPU, memory, network, and I/O statistics

### Images
- **Pull Images**: Enter image name (e.g., `nginx:latest`) and track pull progress
- **Run Container**: Create and start containers from images with custom configuration
- **View Details**: Size, tags, creation date, and container count
- **Remove**: Delete images with conflict detection

### Volumes
- **Create Volume**: Custom name, driver, and options
- **Inspect**: View detailed volume metadata
- **Remove**: Delete with confirmation
- **Search**: Filter volumes by name

## Configuration

### Change Backend Port
Set the `PORT` environment variable:
```bash
PORT=8080 npm run server
```

### Change Frontend Port
Modify `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 5174,
    // ...
  }
});
```

### Docker Socket Location
Update `server.js` if your Docker socket is elsewhere:
```javascript
const docker = new Docker({ socketPath: '/path/to/docker.sock' });
```

## API Endpoints

### Containers
- `GET /api/containers` - List all containers
- `POST /api/containers/create` - Create a new container
- `POST /api/containers/:id/start` - Start a container
- `POST /api/containers/:id/stop` - Stop a container
- `POST /api/containers/:id/restart` - Restart a container
- `DELETE /api/containers/:id` - Remove a container
- `GET /api/containers/:id/logs` - Get container logs
- `GET /api/containers/:id/stats` - Get container stats

### Images
- `GET /api/images` - List all images with container counts
- `POST /api/images/pull` - Pull an image (Server-Sent Events)
- `DELETE /api/images/:id` - Remove an image

### Volumes
- `GET /api/volumes` - List all volumes
- `POST /api/volumes/create` - Create a volume
- `GET /api/volumes/:name/inspect` - Inspect a volume
- `DELETE /api/volumes/:name` - Remove a volume

### System
- `GET /api/info` - Get Docker system info
- `GET /api/events` - Docker events stream (Server-Sent Events)

### WebSocket
- `WS /api/shell?container=<id>` - Interactive terminal session

## Architecture

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: CSS3 with custom properties (dark/light theme)
- **Terminal**: xterm.js with fit addon
- **State Management**: React hooks and context
- **Real-time**: EventSource (SSE) for Docker events, WebSocket for terminal

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Docker API**: dockerode
- **WebSocket**: ws library
- **CORS**: Enabled for development

### Key Technologies
- React for UI components
- Vite for fast HMR and building
- Express for REST API
- dockerode for Docker Engine API
- Server-Sent Events for real-time updates
- WebSocket for interactive terminal
- xterm.js for terminal emulation

## Security Considerations

- **Docker Socket Access**: This app requires full Docker API access via the socket
- **Network Security**: Only expose on trusted networks or behind authentication
- **Production**: Use a reverse proxy (nginx/traefik) with authentication
- **CORS**: Configure CORS properly for production deployments
- **WebSocket**: Secure WebSocket connections in production (wss://)

## Troubleshooting

### Permission Denied on Docker Socket
Add your user to the docker group:
```bash
sudo usermod -aG docker $USER
```
Log out and back in for changes to take effect.

### Cannot Connect to Docker
Check Docker is running:
```bash
sudo systemctl status docker
sudo systemctl start docker  # If not running
```

### Port Already in Use
Kill the process using the port:
```bash
# For port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# For port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### WebSocket Connection Failed
Ensure the backend server is running and accessible. Check browser console for WebSocket errors.

### "Maximum update depth exceeded" Error
This has been fixed by removing the problematic useEffect without dependencies. If you encounter this, ensure you're using the latest code.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

Created for Docker container management and monitoring.
