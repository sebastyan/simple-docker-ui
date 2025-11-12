import { Button } from '../common/Button';

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
                    {isRunning ? (
                      <>
                        <Button variant="stop" onClick={() => onStop(c.Id)}>Stop</Button>
                        <Button variant="restart" onClick={() => onRestart(c.Id)}>Restart</Button>
                        <Button variant="shell" onClick={() => onShell(c.Id, name)}>Shell</Button>
                        <Button variant="logs" onClick={() => onLogs(c.Id)}>Logs</Button>
                        <Button variant="stats" onClick={() => onStats(c.Id)}>Stats</Button>
                      </>
                    ) : (
                      <Button variant="start" onClick={() => onStart(c.Id)}>Start</Button>
                    )}
                    <Button variant="remove" onClick={() => onRemove(c.Id)}>Remove</Button>
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
