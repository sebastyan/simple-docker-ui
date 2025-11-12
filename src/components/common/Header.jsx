import { useTheme } from '../../contexts/ThemeContext';
import { useSystemInfo } from '../../hooks/useSystemInfo';

export const Header = ({ onRefresh }) => {
  const { theme, toggleTheme } = useTheme();
  const { systemInfo } = useSystemInfo();

  const dockerStatus = systemInfo?.DockerStatus || 'unknown';
  const isDockerRunning = dockerStatus === 'running';

  const systemInfoText = systemInfo
    ? `Containers: ${systemInfo.Containers} | Running: ${systemInfo.ContainersRunning} | Images: ${systemInfo.Images}`
    : 'Loading...';

  return (
    <header>
      <h1>UX Docker Manager</h1>
      <div className="header-info">
        <div className="docker-status" title={isDockerRunning ? 'Docker is running' : 'Docker is down or not accessible'}>
          <span className={`status-indicator ${dockerStatus}`}></span>
          <span className="status-text">Docker: {isDockerRunning ? 'Running' : 'Down'}</span>
        </div>
        <span id="system-info">{systemInfoText}</span>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title="Toggle dark/light mode"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="refresh-btn" onClick={onRefresh}>
          Refresh
        </button>
      </div>
    </header>
  );
};
