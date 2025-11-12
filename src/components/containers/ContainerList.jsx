import { ContextMenu } from '../common/ContextMenu';

export const ContainerList = ({
  containers,
  onStart,
  onStop,
  onRestart,
  onRemove,
  onLogs,
  onStats,
  onShell,
}) => {
  return (
    <div className="list-container">
      <table className="list-table">
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
          {containers.map((c) => {
            const status = c.State;
            const name = c.Names[0].replace('/', '');
            const id = c.Id.substring(0, 12);
            const image = c.Image;
            const created = new Date(c.Created * 1000).toLocaleString();
            const ports = c.Ports.map(p =>
              p.PublicPort ? `${p.PublicPort}:${p.PrivatePort}/${p.Type}` : `${p.PrivatePort}/${p.Type}`
            ).join(', ') || 'None';
            const isRunning = status === 'running';

            const menuItems = isRunning
              ? [
                  {
                    label: 'Stop',
                    icon: '◼',
                    onClick: () => onStop(c.Id)
                  },
                  {
                    label: 'Restart',
                    icon: '↻',
                    onClick: () => onRestart(c.Id)
                  },
                  {
                    label: 'Shell',
                    icon: '$',
                    onClick: () => onShell(c.Id, name)
                  },
                  {
                    label: 'Logs',
                    icon: '≡',
                    onClick: () => onLogs(c.Id)
                  },
                  {
                    label: 'Stats',
                    icon: '◐',
                    onClick: () => onStats(c.Id)
                  },
                  {
                    label: 'Remove',
                    icon: '×',
                    variant: 'danger',
                    onClick: () => onRemove(c.Id)
                  }
                ]
              : [
                  {
                    label: 'Start',
                    icon: '▶',
                    onClick: () => onStart(c.Id)
                  },
                  {
                    label: 'Remove',
                    icon: '×',
                    variant: 'danger',
                    onClick: () => onRemove(c.Id)
                  }
                ];

            return (
              <tr key={c.Id}>
                <td><strong>{name}</strong></td>
                <td><span className={`status ${status.toLowerCase()}`}>{status}</span></td>
                <td>{image}</td>
                <td><code>{id}</code></td>
                <td>{ports}</td>
                <td>{created}</td>
                <td>
                  <div className="list-actions">
                    <ContextMenu items={menuItems} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
