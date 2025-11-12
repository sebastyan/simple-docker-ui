import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { ComposeFileModal } from '../modals/ComposeFileModal';

export const Compose = ({ showMessage, showConfirm }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);
  const [services, setServices] = useState({});
  const [fileModal, setFileModal] = useState({ isOpen: false, project: null });

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getComposeProjects();
      setProjects(data);
    } catch (error) {
      showMessage('Error', `Failed to load compose projects: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async (project) => {
    try {
      const data = await api.getComposeServices(project);
      setServices(prev => ({ ...prev, [project]: data }));
    } catch (error) {
      showMessage('Error', `Failed to load services: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleToggleProject = async (projectName) => {
    if (expandedProject === projectName) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectName);
      if (!services[projectName]) {
        await loadServices(projectName);
      }
    }
  };

  const handleStart = async (project) => {
    try {
      await api.startComposeProject(project);
      showMessage('Success', `Started compose project: ${project}`, 'success');
      await loadProjects();
      if (expandedProject === project) {
        await loadServices(project);
      }
    } catch (error) {
      showMessage('Error', `Failed to start: ${error.message}`, 'error');
    }
  };

  const handleStop = async (project) => {
    try {
      await api.stopComposeProject(project);
      showMessage('Success', `Stopped compose project: ${project}`, 'success');
      await loadProjects();
      if (expandedProject === project) {
        await loadServices(project);
      }
    } catch (error) {
      showMessage('Error', `Failed to stop: ${error.message}`, 'error');
    }
  };

  const handleRestart = async (project) => {
    try {
      await api.restartComposeProject(project);
      showMessage('Success', `Restarted compose project: ${project}`, 'success');
      await loadProjects();
      if (expandedProject === project) {
        await loadServices(project);
      }
    } catch (error) {
      showMessage('Error', `Failed to restart: ${error.message}`, 'error');
    }
  };

  const handleDown = (project) => {
    showConfirm(
      'Confirm Down',
      `Are you sure you want to stop and remove project "${project}"?`,
      async () => {
        try {
          await api.downComposeProject(project);
          showMessage('Success', `Removed compose project: ${project}`, 'success');
          await loadProjects();
        } catch (error) {
          showMessage('Error', `Failed to remove: ${error.message}`, 'error');
        }
      },
      'Down',
      'danger'
    );
  };

  const handleViewFile = (project) => {
    setFileModal({ isOpen: true, project });
  };

  if (loading) {
    return <div className="loading">Loading compose projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="tab-content active">
        <div className="section-header">
          <h2>Compose Projects</h2>
        </div>
        <div className="loading">No compose projects found</div>
      </div>
    );
  }

  return (
    <div className="tab-content active">
      <div className="section-header">
        <h2>Compose Projects</h2>
      </div>
      <div className="compose-projects">
        {projects.map((project) => (
          <div key={project.Name} className="compose-project">
            <div className="compose-project-header" onClick={() => handleToggleProject(project.Name)}>
              <div className="compose-project-info">
                <h3>{project.Name}</h3>
                <div className="compose-project-meta">
                  <span className="compose-status">
                    Status: {project.Status || 'unknown'}
                  </span>
                  <span className="compose-path">
                    {project.ConfigFiles || 'No config file'}
                  </span>
                </div>
              </div>
              <span className="expand-icon">{expandedProject === project.Name ? '▼' : '▶'}</span>
            </div>

            {expandedProject === project.Name && (
              <div className="compose-project-details">
                <div className="compose-actions">
                  <button className="btn btn-start" onClick={() => handleStart(project.Name)}>
                    Start
                  </button>
                  <button className="btn btn-stop" onClick={() => handleStop(project.Name)}>
                    Stop
                  </button>
                  <button className="btn btn-restart" onClick={() => handleRestart(project.Name)}>
                    Restart
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDown(project.Name)}>
                    Down
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleViewFile(project.Name)}>
                    View File
                  </button>
                </div>

                {services[project.Name] && services[project.Name].length > 0 && (
                  <div className="compose-services">
                    <h4>Services:</h4>
                    <div className="services-list">
                      {services[project.Name].map((service, idx) => (
                        <div key={idx} className="service-item">
                          <div className="service-name">{service.Service || service.Name}</div>
                          <div className="service-status">
                            <span className={`status ${service.State?.toLowerCase()}`}>
                              {service.State || 'unknown'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <ComposeFileModal
        isOpen={fileModal.isOpen}
        onClose={() => setFileModal({ isOpen: false, project: null })}
        project={fileModal.project}
      />
    </div>
  );
};
