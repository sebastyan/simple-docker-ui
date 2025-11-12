import { useState, useMemo } from 'react';
import { Header } from './components/common/Header';
import { Tabs } from './components/common/Tabs';
import { Containers } from './components/containers/Containers';
import { Images } from './components/images/Images';
import { Volumes } from './components/volumes/Volumes';
import { Compose } from './components/compose/Compose';
import { LogsModal } from './components/modals/LogsModal';
import { StatsModal } from './components/modals/StatsModal';
import { CreateContainerModal } from './components/modals/CreateContainerModal';
import { CreateVolumeModal } from './components/modals/CreateVolumeModal';
import { VolumeInspectModal } from './components/modals/VolumeInspectModal';
import { TerminalModal } from './components/modals/TerminalModal';
import { PullProgressModal } from './components/modals/PullProgressModal';
import { MessageModal } from './components/common/MessageModal';
import { ConfirmModal } from './components/common/ConfirmModal';
import { useSystemInfo } from './hooks/useSystemInfo';
import { useContainers } from './hooks/useContainers';
import { useImages } from './hooks/useImages';
import { useVolumes } from './hooks/useVolumes';
import { useDockerEvents } from './hooks/useDockerEvents';

function App() {
  const [activeTab, setActiveTab] = useState('Containers');
  const { refresh: refreshSystemInfo } = useSystemInfo();
  const { refresh: refreshContainers } = useContainers();
  const { refresh: refreshImages } = useImages();
  const { refresh: refreshVolumes } = useVolumes();

  // Modal states
  const [logsModal, setLogsModal] = useState({ isOpen: false, containerId: null });
  const [statsModal, setStatsModal] = useState({ isOpen: false, containerId: null });
  const [createContainerModal, setCreateContainerModal] = useState({
    isOpen: false,
    imageId: null,
    imageName: null,
  });
  const [createVolumeModal, setCreateVolumeModal] = useState(false);
  const [volumeInspectModal, setVolumeInspectModal] = useState({ isOpen: false, volumeName: null });
  const [terminalModal, setTerminalModal] = useState({
    isOpen: false,
    containerId: null,
    containerName: null,
  });
  const [pullProgressModal, setPullProgressModal] = useState({ isOpen: false, imageName: null });
  const [activePulls, setActivePulls] = useState([]);
  const [messageModal, setMessageModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: 'Confirm', variant: 'primary' });

  // Helper functions for modals
  const showMessage = (title, message, type = 'info') => {
    setMessageModal({ isOpen: true, title, message, type });
  };

  const showConfirm = (title, message, onConfirm, confirmText = 'Confirm', variant = 'primary') => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, confirmText, variant });
  };

  // Setup Docker events listener for real-time updates
  const eventCallbacks = useMemo(() => ({
    onContainerChange: () => {
      console.log('[App] Container change detected, refreshing containers...');
      refreshContainers();
    },
    onImageChange: () => {
      console.log('[App] Image change detected, refreshing images...');
      refreshImages();
    },
    onVolumeChange: () => {
      console.log('[App] Volume change detected, refreshing volumes...');
      refreshVolumes();
    },
    onSystemInfoChange: () => {
      console.log('[App] System info change detected, refreshing...');
      refreshSystemInfo();
    }
  }), [refreshContainers, refreshImages, refreshVolumes, refreshSystemInfo]);

  useDockerEvents(eventCallbacks);

  const handleRefreshAll = () => {
    refreshSystemInfo();
    if (activeTab === 'Containers') refreshContainers();
    else if (activeTab === 'Images') refreshImages();
    else if (activeTab === 'Volumes') refreshVolumes();
  };

  const handleShowLogs = (containerId) => {
    setLogsModal({ isOpen: true, containerId });
  };

  const handleShowStats = (containerId) => {
    setStatsModal({ isOpen: true, containerId });
  };

  const handleShowShell = (containerId, containerName) => {
    setTerminalModal({ isOpen: true, containerId, containerName });
  };

  const handleRunContainer = (imageId, imageName) => {
    setCreateContainerModal({ isOpen: true, imageId, imageName });
  };

  const handlePullImage = (imageName) => {
    // Add to active pulls if not already present
    if (!activePulls.find(p => p.imageName === imageName)) {
      setActivePulls(prev => [...prev, {
        imageName,
        status: 'pulling',
        layers: {},
        message: 'Starting pull...'
      }]);
    }
    setPullProgressModal({ isOpen: true, imageName });
  };

  const handlePullProgress = (imageName, layers, status, message) => {
    setActivePulls(prev => prev.map(pull =>
      pull.imageName === imageName
        ? { ...pull, layers, status, message }
        : pull
    ));
  };

  const handlePullComplete = (imageName) => {
    // Remove from active pulls after a delay
    setTimeout(() => {
      setActivePulls(prev => prev.filter(p => p.imageName !== imageName));
    }, 3000);
    refreshImages();
    refreshSystemInfo();
  };

  const handleOpenPullProgress = (imageName) => {
    setPullProgressModal({ isOpen: true, imageName });
  };

  const handleCreateVolume = () => {
    setCreateVolumeModal(true);
  };

  const handleInspectVolume = (volumeName) => {
    setVolumeInspectModal({ isOpen: true, volumeName });
  };

  const handleContainerCreated = () => {
    refreshContainers();
    refreshSystemInfo();
    setActiveTab('Containers');
  };

  const handleImagePulled = () => {
    refreshImages();
    refreshSystemInfo();
  };

  const handleVolumeCreated = () => {
    refreshVolumes();
    refreshSystemInfo();
  };

  return (
    <div className="container">
      <Header onRefresh={handleRefreshAll} />

      <Tabs
        tabs={['Containers', 'Images', 'Volumes', 'Compose']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'Containers' && (
        <Containers
          onLogs={handleShowLogs}
          onStats={handleShowStats}
          onShell={handleShowShell}
          onRefresh={refreshSystemInfo}
          showMessage={showMessage}
          showConfirm={showConfirm}
        />
      )}

      {activeTab === 'Images' && (
        <Images
          onRun={handleRunContainer}
          onPullImage={handlePullImage}
          onRefresh={refreshSystemInfo}
          activePulls={activePulls}
          onOpenPullProgress={handleOpenPullProgress}
          showMessage={showMessage}
          showConfirm={showConfirm}
        />
      )}

      {activeTab === 'Volumes' && (
        <Volumes
          onCreateVolume={handleCreateVolume}
          onInspect={handleInspectVolume}
          onRefresh={refreshSystemInfo}
          showMessage={showMessage}
          showConfirm={showConfirm}
        />
      )}

      {activeTab === 'Compose' && (
        <Compose
          showMessage={showMessage}
          showConfirm={showConfirm}
        />
      )}

      <LogsModal
        isOpen={logsModal.isOpen}
        onClose={() => setLogsModal({ isOpen: false, containerId: null })}
        containerId={logsModal.containerId}
      />

      <StatsModal
        isOpen={statsModal.isOpen}
        onClose={() => setStatsModal({ isOpen: false, containerId: null })}
        containerId={statsModal.containerId}
      />

      <CreateContainerModal
        isOpen={createContainerModal.isOpen}
        onClose={() => setCreateContainerModal({ isOpen: false, imageId: null, imageName: null })}
        imageId={createContainerModal.imageId}
        imageName={createContainerModal.imageName}
        onSuccess={handleContainerCreated}
        showMessage={showMessage}
      />

      <CreateVolumeModal
        isOpen={createVolumeModal}
        onClose={() => setCreateVolumeModal(false)}
        onSuccess={handleVolumeCreated}
        showMessage={showMessage}
      />

      <VolumeInspectModal
        isOpen={volumeInspectModal.isOpen}
        onClose={() => setVolumeInspectModal({ isOpen: false, volumeName: null })}
        volumeName={volumeInspectModal.volumeName}
        showMessage={showMessage}
      />

      <TerminalModal
        isOpen={terminalModal.isOpen}
        onClose={() => setTerminalModal({ isOpen: false, containerId: null, containerName: null })}
        containerId={terminalModal.containerId}
        containerName={terminalModal.containerName}
      />

      <PullProgressModal
        isOpen={pullProgressModal.isOpen}
        onClose={() => setPullProgressModal({ isOpen: false, imageName: null })}
        imageName={pullProgressModal.imageName}
        activePull={activePulls.find(p => p.imageName === pullProgressModal.imageName)}
        onProgress={handlePullProgress}
        onComplete={handlePullComplete}
      />

      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal({ isOpen: false, title: '', message: '', type: 'info' })}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
      />
    </div>
  );
}

export default App;
