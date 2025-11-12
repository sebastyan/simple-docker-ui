const API_URL = 'http://localhost:3000/api';

// Theme management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeButton('☀️');
    } else {
        document.documentElement.removeAttribute('data-theme');
        updateThemeButton('🌙');
    }
}

function updateThemeButton(icon) {
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.textContent = icon;
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
}

// View state management
const viewState = {
    containers: 'cards',
    images: 'cards',
    volumes: 'cards'
};

// Data cache for filtering
let containersData = [];
let imagesData = [];
let volumesData = [];

// Set view (cards or list)
function setView(section, view) {
    viewState[section] = view;

    // Update button states
    const tabContent = document.getElementById(`${section}-tab`);
    const viewBtns = tabContent.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.classList.remove('active');
        if ((view === 'cards' && btn.textContent.includes('⊞')) ||
            (view === 'list' && btn.textContent.includes('☰'))) {
            btn.classList.add('active');
        }
    });

    // Re-render content with new view (preserves search filter)
    if (section === 'containers') {
        filterContainers();
    } else if (section === 'images') {
        filterImages();
    } else if (section === 'volumes') {
        filterVolumes();
    }
}

// Tab switching
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const btns = document.querySelectorAll('.tab-btn');

    tabs.forEach(tab => tab.classList.remove('active'));
    btns.forEach(btn => btn.classList.remove('active'));

    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Find and activate the corresponding tab button
    btns.forEach(btn => {
        if (btn.textContent.toLowerCase() === tabName) {
            btn.classList.add('active');
        }
    });

    if (tabName === 'containers') {
        loadContainers();
    } else if (tabName === 'images') {
        loadImages();
    } else if (tabName === 'volumes') {
        loadVolumes();
    }
}

// Load system info
async function loadSystemInfo() {
    try {
        const response = await fetch(`${API_URL}/info`);
        const data = await response.json();
        document.getElementById('system-info').textContent =
            `Containers: ${data.Containers} | Running: ${data.ContainersRunning} | Images: ${data.Images}`;
    } catch (error) {
        console.error('Error loading system info:', error);
        document.getElementById('system-info').textContent = 'Error loading info';
    }
}

// Load containers
async function loadContainers() {
    const container = document.getElementById('containers-list');
    container.innerHTML = '<div class="loading">Loading containers...</div>';

    try {
        const response = await fetch(`${API_URL}/containers`);
        containersData = await response.json();

        if (containersData.length === 0) {
            container.innerHTML = '<div class="loading">No containers found</div>';
            return;
        }

        renderContainers(containersData);
    } catch (error) {
        console.error('Error loading containers:', error);
        container.innerHTML = '<div class="loading">Error loading containers</div>';
    }
}

function renderContainers(containers) {
    const container = document.getElementById('containers-list');

    if (containers.length === 0) {
        container.innerHTML = '<div class="loading">No containers match your search</div>';
        return;
    }

    if (viewState.containers === 'list') {
        container.className = 'list-container';
        container.innerHTML = createContainersListView(containers);
    } else {
        container.className = 'cards-container';
        container.innerHTML = containers.map(c => createContainerCard(c)).join('');
    }
}

function filterContainers() {
    const searchTerm = document.getElementById('search-containers').value.toLowerCase();
    const filtered = containersData.filter(c => {
        const name = c.Names[0].replace('/', '').toLowerCase();
        return name.includes(searchTerm);
    });
    renderContainers(filtered);
}

// Create container card HTML
function createContainerCard(container) {
    const status = container.State;
    const name = container.Names[0].replace('/', '');
    const id = container.Id.substring(0, 12);
    const image = container.Image;
    const created = new Date(container.Created * 1000).toLocaleString();

    const ports = container.Ports.map(p =>
        p.PublicPort ? `${p.PublicPort}:${p.PrivatePort}/${p.Type}` : `${p.PrivatePort}/${p.Type}`
    ).join(', ') || 'None';

    return `
        <div class="card">
            <div class="card-header">
                <div class="card-title">${name}</div>
                <div class="status ${status.toLowerCase()}">${status}</div>
            </div>
            <div class="card-info">
                <div class="info-row">
                    <span class="info-label">ID:</span>
                    <span class="info-value">${id}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Image:</span>
                    <span class="info-value">${image}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ports:</span>
                    <span class="info-value">${ports}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Created:</span>
                    <span class="info-value">${created}</span>
                </div>
            </div>
            <div class="card-actions">
                ${status === 'running' ? `
                    <button class="btn btn-stop" onclick="stopContainer('${container.Id}')">Stop</button>
                    <button class="btn btn-restart" onclick="restartContainer('${container.Id}')">Restart</button>
                    <button class="btn btn-shell" onclick="openTerminal('${container.Id}', '${name}')">Shell</button>
                    <button class="btn btn-logs" onclick="showLogs('${container.Id}')">Logs</button>
                    <button class="btn btn-stats" onclick="showStats('${container.Id}')">Stats</button>
                ` : `
                    <button class="btn btn-start" onclick="startContainer('${container.Id}')">Start</button>
                `}
                <button class="btn btn-remove" onclick="removeContainer('${container.Id}')">Remove</button>
            </div>
        </div>
    `;
}

// Create containers list view
function createContainersListView(containers) {
    return `
        <table class="list-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Image</th>
                    <th>ID</th>
                    <th>Ports</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${containers.map(c => {
                    const status = c.State;
                    const name = c.Names[0].replace('/', '');
                    const id = c.Id.substring(0, 12);
                    const image = c.Image;
                    const created = new Date(c.Created * 1000).toLocaleString();
                    const ports = c.Ports.map(p =>
                        p.PublicPort ? `${p.PublicPort}:${p.PrivatePort}/${p.Type}` : `${p.PrivatePort}/${p.Type}`
                    ).join(', ') || 'None';

                    return `
                        <tr>
                            <td><strong>${name}</strong></td>
                            <td><span class="status ${status.toLowerCase()}">${status}</span></td>
                            <td>${image}</td>
                            <td><code>${id}</code></td>
                            <td>${ports}</td>
                            <td>${created}</td>
                            <td>
                                <div class="list-actions">
                                    ${status === 'running' ? `
                                        <button class="btn btn-stop" onclick="stopContainer('${c.Id}')">Stop</button>
                                        <button class="btn btn-restart" onclick="restartContainer('${c.Id}')">Restart</button>
                                        <button class="btn btn-shell" onclick="openTerminal('${c.Id}', '${name}')">Shell</button>
                                        <button class="btn btn-logs" onclick="showLogs('${c.Id}')">Logs</button>
                                        <button class="btn btn-stats" onclick="showStats('${c.Id}')">Stats</button>
                                    ` : `
                                        <button class="btn btn-start" onclick="startContainer('${c.Id}')">Start</button>
                                    `}
                                    <button class="btn btn-remove" onclick="removeContainer('${c.Id}')">Remove</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// Container actions
async function startContainer(id) {
    try {
        await fetch(`${API_URL}/containers/${id}/start`, { method: 'POST' });
        await loadContainers();
        await loadSystemInfo();
    } catch (error) {
        alert('Error starting container: ' + error.message);
    }
}

async function stopContainer(id) {
    try {
        await fetch(`${API_URL}/containers/${id}/stop`, { method: 'POST' });
        await loadContainers();
        await loadSystemInfo();
    } catch (error) {
        alert('Error stopping container: ' + error.message);
    }
}

async function restartContainer(id) {
    try {
        await fetch(`${API_URL}/containers/${id}/restart`, { method: 'POST' });
        await loadContainers();
    } catch (error) {
        alert('Error restarting container: ' + error.message);
    }
}

async function removeContainer(id) {
    if (!confirm('Are you sure you want to remove this container?')) return;

    try {
        await fetch(`${API_URL}/containers/${id}`, { method: 'DELETE' });
        await loadContainers();
        await loadSystemInfo();
    } catch (error) {
        alert('Error removing container: ' + error.message);
    }
}

// Show logs
async function showLogs(id) {
    const modal = document.getElementById('logs-modal');
    const content = document.getElementById('logs-content');

    modal.classList.add('active');
    content.textContent = 'Loading logs...';

    try {
        const response = await fetch(`${API_URL}/containers/${id}/logs`);
        const logs = await response.text();
        content.textContent = logs || 'No logs available';
    } catch (error) {
        content.textContent = 'Error loading logs: ' + error.message;
    }
}

function closeLogsModal() {
    document.getElementById('logs-modal').classList.remove('active');
}

// Show stats
async function showStats(id) {
    const modal = document.getElementById('stats-modal');
    const content = document.getElementById('stats-content');

    modal.classList.add('active');
    content.innerHTML = '<div class="loading">Loading stats...</div>';

    try {
        const response = await fetch(`${API_URL}/containers/${id}/stats`);
        const stats = await response.json();

        const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
        const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
        const cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100;

        const memUsage = stats.memory_stats.usage;
        const memLimit = stats.memory_stats.limit;
        const memPercent = (memUsage / memLimit) * 100;

        const netInput = stats.networks?.eth0?.rx_bytes || 0;
        const netOutput = stats.networks?.eth0?.tx_bytes || 0;

        content.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">CPU Usage</div>
                <div class="stat-value">${cpuPercent.toFixed(2)}%</div>
                <div class="stat-bar">
                    <div class="stat-bar-fill" style="width: ${Math.min(cpuPercent, 100)}%"></div>
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Memory Usage</div>
                <div class="stat-value">${formatBytes(memUsage)} / ${formatBytes(memLimit)} (${memPercent.toFixed(2)}%)</div>
                <div class="stat-bar">
                    <div class="stat-bar-fill" style="width: ${memPercent}%"></div>
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Network I/O</div>
                <div class="stat-value">In: ${formatBytes(netInput)} / Out: ${formatBytes(netOutput)}</div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="loading">Error loading stats: ${error.message}</div>`;
    }
}

function closeStatsModal() {
    document.getElementById('stats-modal').classList.remove('active');
}

// Load images
async function loadImages() {
    const container = document.getElementById('images-list');
    container.innerHTML = '<div class="loading">Loading images...</div>';

    try {
        const response = await fetch(`${API_URL}/images`);
        imagesData = await response.json();

        if (imagesData.length === 0) {
            container.innerHTML = '<div class="loading">No images found</div>';
            return;
        }

        renderImages(imagesData);
    } catch (error) {
        console.error('Error loading images:', error);
        container.innerHTML = '<div class="loading">Error loading images</div>';
    }
}

function renderImages(images) {
    const container = document.getElementById('images-list');

    if (images.length === 0) {
        container.innerHTML = '<div class="loading">No images match your search</div>';
        return;
    }

    if (viewState.images === 'list') {
        container.className = 'list-container';
        container.innerHTML = createImagesListView(images);
    } else {
        container.className = 'cards-container';
        container.innerHTML = images.map(img => createImageCard(img)).join('');
    }
}

function filterImages() {
    const searchTerm = document.getElementById('search-images').value.toLowerCase();
    const filtered = imagesData.filter(img => {
        const tags = img.RepoTags ? img.RepoTags.join(', ').toLowerCase() : '<none>';
        return tags.includes(searchTerm);
    });
    renderImages(filtered);
}

// Create image card HTML
function createImageCard(image) {
    const id = image.Id.replace('sha256:', '').substring(0, 12);
    const tags = image.RepoTags ? image.RepoTags.join(', ') : '<none>';
    const size = formatBytes(image.Size);
    const created = new Date(image.Created * 1000).toLocaleString();

    return `
        <div class="card">
            <div class="card-header">
                <div class="card-title">${tags}</div>
            </div>
            <div class="card-info">
                <div class="info-row">
                    <span class="info-label">ID:</span>
                    <span class="info-value">${id}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Size:</span>
                    <span class="info-value">${size}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Created:</span>
                    <span class="info-value">${created}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn btn-run" onclick="showCreateModal('${image.Id}', '${tags}')">Run</button>
                <button class="btn btn-remove" onclick="removeImage('${image.Id}')">Remove</button>
            </div>
        </div>
    `;
}

// Create images list view
function createImagesListView(images) {
    return `
        <table class="list-table">
            <thead>
                <tr>
                    <th>Tags</th>
                    <th>ID</th>
                    <th>Size</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${images.map(img => {
                    const id = img.Id.replace('sha256:', '').substring(0, 12);
                    const tags = img.RepoTags ? img.RepoTags.join(', ') : '<none>';
                    const size = formatBytes(img.Size);
                    const created = new Date(img.Created * 1000).toLocaleString();

                    return `
                        <tr>
                            <td><strong>${tags}</strong></td>
                            <td><code>${id}</code></td>
                            <td>${size}</td>
                            <td>${created}</td>
                            <td>
                                <div class="list-actions">
                                    <button class="btn btn-run" onclick="showCreateModal('${img.Id}', '${tags}')">Run</button>
                                    <button class="btn btn-remove" onclick="removeImage('${img.Id}')">Remove</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// Image actions
async function removeImage(id) {
    if (!confirm('Are you sure you want to remove this image?')) return;

    try {
        await fetch(`${API_URL}/images/${id}`, { method: 'DELETE' });
        await loadImages();
        await loadSystemInfo();
    } catch (error) {
        alert('Error removing image: ' + error.message);
    }
}

async function pullImage() {
    const imageName = document.getElementById('image-name').value.trim();
    if (!imageName) {
        alert('Please enter an image name');
        return;
    }

    // Show progress modal
    const modal = document.getElementById('pull-progress-modal');
    const content = document.getElementById('pull-progress-content');
    modal.classList.add('active');
    content.innerHTML = '<div class="pull-status">Starting pull...</div>';

    // Update modal title
    document.querySelector('#pull-progress-modal .modal-header h3').textContent = `Pulling: ${imageName}`;

    // Track layers
    const layers = {};

    try {
        const response = await fetch(`${API_URL}/images/pull`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageName })
        });

        if (!response.ok) {
            throw new Error('Failed to start image pull');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));

                        if (data.status === 'complete') {
                            content.innerHTML = '<div class="pull-complete">✓ Image pulled successfully!</div>';
                            document.getElementById('image-name').value = '';
                            setTimeout(async () => {
                                closePullProgressModal();
                                await loadImages();
                                await loadSystemInfo();
                            }, 2000);
                        } else if (data.status === 'error') {
                            content.innerHTML = `<div class="pull-error">✗ Error: ${data.message}</div>`;
                        } else {
                            updatePullProgress(layers, data);
                            renderPullProgress(content, layers);
                        }
                    } catch (e) {
                        console.error('Error parsing progress:', e);
                    }
                }
            }
        }
    } catch (error) {
        content.innerHTML = `<div class="pull-error">✗ Error pulling image: ${error.message}</div>`;
    }
}

function updatePullProgress(layers, data) {
    if (data.id) {
        if (!layers[data.id]) {
            layers[data.id] = {};
        }
        layers[data.id] = { ...layers[data.id], ...data };
    }
}

function renderPullProgress(content, layers) {
    const layerIds = Object.keys(layers);
    if (layerIds.length === 0) {
        content.innerHTML = '<div class="pull-status">Initializing...</div>';
        return;
    }

    let html = '';
    for (const id of layerIds) {
        const layer = layers[id];
        const status = layer.status || '';
        const progressDetail = layer.progressDetail || {};

        let progressPercent = 0;
        if (progressDetail.current && progressDetail.total) {
            progressPercent = (progressDetail.current / progressDetail.total) * 100;
        }

        html += `
            <div class="pull-status">
                <div class="pull-status-header">${id}</div>
                <div class="pull-status-text">${status}${layer.progress ? ' ' + layer.progress : ''}</div>
                ${progressPercent > 0 ? `
                    <div class="pull-progress-bar">
                        <div class="pull-progress-bar-fill" style="width: ${progressPercent}%"></div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    content.innerHTML = html;
    // Auto-scroll to bottom
    content.scrollTop = content.scrollHeight;
}

function closePullProgressModal() {
    document.getElementById('pull-progress-modal').classList.remove('active');
}

// Container creation
function showCreateModal(imageId, imageName) {
    const modal = document.getElementById('create-modal');
    document.getElementById('create-image').value = imageId;
    document.getElementById('create-image-display').value = imageName;
    document.getElementById('create-name').value = '';
    document.getElementById('create-ports').value = '';
    document.getElementById('create-env').value = '';
    document.getElementById('create-volumes').value = '';
    modal.classList.add('active');
}

function closeCreateModal() {
    document.getElementById('create-modal').classList.remove('active');
}

async function createContainer() {
    const imageId = document.getElementById('create-image').value;
    const imageName = document.getElementById('create-image-display').value;
    const name = document.getElementById('create-name').value.trim();
    const portsText = document.getElementById('create-ports').value.trim();
    const envText = document.getElementById('create-env').value.trim();
    const volumesText = document.getElementById('create-volumes').value.trim();

    // Parse ports
    const ports = portsText ? portsText.split('\n').map(p => p.trim()).filter(p => p) : [];

    // Parse environment variables
    const env = [];
    if (envText) {
        const envLines = envText.split('\n').map(e => e.trim()).filter(e => e);
        envLines.forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                env.push({ key: key.trim(), value: valueParts.join('=').trim() });
            }
        });
    }

    // Parse volumes
    const volumes = [];
    if (volumesText) {
        const volumeLines = volumesText.split('\n').map(v => v.trim()).filter(v => v);
        volumeLines.forEach(line => {
            const [host, container] = line.split(':');
            if (host && container) {
                volumes.push({ host: host.trim(), container: container.trim() });
            }
        });
    }

    try {
        const response = await fetch(`${API_URL}/containers/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: imageName,
                name: name || undefined,
                ports,
                env,
                volumes
            })
        });

        if (response.ok) {
            const result = await response.json();
            alert('Container created and started successfully!');
            closeCreateModal();
            showTab('containers');
            await loadContainers();
            await loadSystemInfo();
        } else {
            const error = await response.json();
            alert('Error creating container: ' + error.error);
        }
    } catch (error) {
        alert('Error creating container: ' + error.message);
    }
}

// Volume management
async function loadVolumes() {
    const container = document.getElementById('volumes-list');
    container.innerHTML = '<div class="loading">Loading volumes...</div>';

    try {
        const response = await fetch(`${API_URL}/volumes`);
        volumesData = await response.json();

        if (!volumesData || volumesData.length === 0) {
            container.innerHTML = '<div class="loading">No volumes found</div>';
            return;
        }

        renderVolumes(volumesData);
    } catch (error) {
        console.error('Error loading volumes:', error);
        container.innerHTML = '<div class="loading">Error loading volumes</div>';
    }
}

function renderVolumes(volumes) {
    const container = document.getElementById('volumes-list');

    if (!volumes || volumes.length === 0) {
        container.innerHTML = '<div class="loading">No volumes match your search</div>';
        return;
    }

    if (viewState.volumes === 'list') {
        container.className = 'list-container';
        container.innerHTML = createVolumesListView(volumes);
    } else {
        container.className = 'cards-container';
        container.innerHTML = volumes.map(v => createVolumeCard(v)).join('');
    }
}

function filterVolumes() {
    const searchTerm = document.getElementById('search-volumes').value.toLowerCase();
    const filtered = volumesData.filter(v => {
        const name = v.Name.toLowerCase();
        return name.includes(searchTerm);
    });
    renderVolumes(filtered);
}

function createVolumeCard(volume) {
    const name = volume.Name;
    const driver = volume.Driver;
    const mountpoint = volume.Mountpoint;
    const created = new Date(volume.CreatedAt).toLocaleString();

    return `
        <div class="card">
            <div class="card-header">
                <div class="card-title">${name}</div>
            </div>
            <div class="card-info">
                <div class="info-row">
                    <span class="info-label">Driver:</span>
                    <span class="info-value">${driver}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Mountpoint:</span>
                    <span class="info-value">${mountpoint}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Created:</span>
                    <span class="info-value">${created}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn btn-stats" onclick="inspectVolume('${name}')">Inspect</button>
                <button class="btn btn-remove" onclick="removeVolume('${name}')">Remove</button>
            </div>
        </div>
    `;
}

// Create volumes list view
function createVolumesListView(volumes) {
    return `
        <table class="list-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Driver</th>
                    <th>Mountpoint</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${volumes.map(v => {
                    const name = v.Name;
                    const driver = v.Driver;
                    const mountpoint = v.Mountpoint;
                    const created = new Date(v.CreatedAt).toLocaleString();

                    return `
                        <tr>
                            <td><strong>${name}</strong></td>
                            <td>${driver}</td>
                            <td>${mountpoint}</td>
                            <td>${created}</td>
                            <td>
                                <div class="list-actions">
                                    <button class="btn btn-stats" onclick="inspectVolume('${name}')">Inspect</button>
                                    <button class="btn btn-remove" onclick="removeVolume('${name}')">Remove</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function showCreateVolumeModal() {
    const modal = document.getElementById('create-volume-modal');
    document.getElementById('volume-name').value = '';
    document.getElementById('volume-driver').value = 'local';
    modal.classList.add('active');
}

function closeCreateVolumeModal() {
    document.getElementById('create-volume-modal').classList.remove('active');
}

async function createVolume() {
    const name = document.getElementById('volume-name').value.trim();
    const driver = document.getElementById('volume-driver').value.trim() || 'local';

    try {
        const response = await fetch(`${API_URL}/volumes/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name || undefined, driver })
        });

        if (response.ok) {
            alert('Volume created successfully!');
            closeCreateVolumeModal();
            await loadVolumes();
            await loadSystemInfo();
        } else {
            const error = await response.json();
            alert('Error creating volume: ' + error.error);
        }
    } catch (error) {
        alert('Error creating volume: ' + error.message);
    }
}

async function removeVolume(name) {
    if (!confirm(`Are you sure you want to remove volume "${name}"?`)) return;

    try {
        await fetch(`${API_URL}/volumes/${name}`, { method: 'DELETE' });
        await loadVolumes();
        await loadSystemInfo();
    } catch (error) {
        alert('Error removing volume: ' + error.message);
    }
}

async function inspectVolume(name) {
    const modal = document.getElementById('volume-inspect-modal');
    const content = document.getElementById('volume-inspect-content');

    modal.classList.add('active');
    content.innerHTML = '<div class="loading">Loading volume details...</div>';

    try {
        const response = await fetch(`${API_URL}/volumes/${name}/inspect`);
        const info = await response.json();

        content.innerHTML = `
            <div class="form-group">
                <label>Name:</label>
                <input type="text" value="${info.Name}" readonly />
            </div>
            <div class="form-group">
                <label>Driver:</label>
                <input type="text" value="${info.Driver}" readonly />
            </div>
            <div class="form-group">
                <label>Mountpoint:</label>
                <input type="text" value="${info.Mountpoint}" readonly />
            </div>
            <div class="form-group">
                <label>Created:</label>
                <input type="text" value="${new Date(info.CreatedAt).toLocaleString()}" readonly />
            </div>
            <div class="form-group">
                <label>Scope:</label>
                <input type="text" value="${info.Scope}" readonly />
            </div>
            ${info.Labels && Object.keys(info.Labels).length > 0 ? `
                <div class="form-group">
                    <label>Labels:</label>
                    <textarea readonly rows="3">${Object.entries(info.Labels).map(([k, v]) => `${k}=${v}`).join('\n')}</textarea>
                </div>
            ` : ''}
        `;
    } catch (error) {
        content.innerHTML = `<div class="loading">Error loading volume details: ${error.message}</div>`;
    }
}

function closeVolumeInspectModal() {
    document.getElementById('volume-inspect-modal').classList.remove('active');
}

// Helper functions
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function refreshAll() {
    loadSystemInfo();
    const activeTabBtn = document.querySelector('.tab-btn.active');
    if (activeTabBtn) {
        const activeTab = activeTabBtn.textContent.toLowerCase();
        if (activeTab === 'containers') {
            loadContainers();
        } else if (activeTab === 'images') {
            loadImages();
        } else if (activeTab === 'volumes') {
            loadVolumes();
        }
    }
}

// Terminal management
let terminal = null;
let terminalSocket = null;
let fitAddon = null;

function openTerminal(containerId, containerName) {
    const modal = document.getElementById('terminal-modal');
    const container = document.getElementById('terminal-container');

    // Update modal title
    document.querySelector('#terminal-modal .modal-header h3').textContent = `Shell - ${containerName}`;

    // Clear previous terminal
    container.innerHTML = '';

    // Create terminal
    terminal = new Terminal({
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
    fitAddon = new FitAddon.FitAddon();
    terminal.loadAddon(fitAddon);

    // Open terminal in container
    terminal.open(container);
    fitAddon.fit();

    // Show modal
    modal.classList.add('active');

    // Connect WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/shell?container=${containerId}`;
    terminalSocket = new WebSocket(wsUrl);

    terminalSocket.onopen = () => {
        terminal.write('\r\n*** Connected to container shell ***\r\n\r\n');

        // Send data from terminal to websocket
        terminal.onData((data) => {
            if (terminalSocket && terminalSocket.readyState === WebSocket.OPEN) {
                terminalSocket.send(data);
            }
        });
    };

    terminalSocket.onmessage = (event) => {
        if (terminal) {
            terminal.write(event.data);
        }
    };

    terminalSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        terminal.write('\r\n*** Connection error ***\r\n');
    };

    terminalSocket.onclose = () => {
        if (terminal) {
            terminal.write('\r\n*** Connection closed ***\r\n');
        }
    };

    // Handle window resize
    window.addEventListener('resize', () => {
        if (fitAddon && terminal) {
            fitAddon.fit();
        }
    });
}

function closeTerminal() {
    const modal = document.getElementById('terminal-modal');
    modal.classList.remove('active');

    // Close websocket
    if (terminalSocket) {
        terminalSocket.close();
        terminalSocket = null;
    }

    // Dispose terminal
    if (terminal) {
        terminal.dispose();
        terminal = null;
    }

    fitAddon = null;
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');

        // If closing terminal modal, clean up
        if (event.target.id === 'terminal-modal') {
            closeTerminal();
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadSystemInfo();
    loadContainers();

    // Auto-refresh every 10 seconds
    setInterval(() => {
        loadSystemInfo();
        const activeTabBtn = document.querySelector('.tab-btn.active');
        if (activeTabBtn) {
            const activeTab = activeTabBtn.textContent.toLowerCase();
            if (activeTab === 'containers') {
                loadContainers();
            }
        }
    }, 10000);
});
