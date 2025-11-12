import { Card, CardHeader, CardTitle, CardInfo, CardActions, InfoRow } from '../common/Card';
import { Status } from '../common/Status';
import { Button } from '../common/Button';

export const ContainerCard = ({
  container,
  onStart,
  onStop,
  onRestart,
  onRemove,
  onLogs,
  onStats,
  onShell,
}) => {
  const status = container.State;
  const name = container.Names[0].replace('/', '');
  const id = container.Id.substring(0, 12);
  const image = container.Image;
  const created = new Date(container.Created * 1000).toLocaleString();

  const ports = container.Ports.map(p =>
    p.PublicPort ? `${p.PublicPort}:${p.PrivatePort}/${p.Type}` : `${p.PrivatePort}/${p.Type}`
  ).join(', ') || 'None';

  const isRunning = status === 'running';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <Status status={status} />
      </CardHeader>
      <CardInfo>
        <InfoRow label="ID" value={id} />
        <InfoRow label="Image" value={image} />
        <InfoRow label="Ports" value={ports} />
        <InfoRow label="Created" value={created} />
      </CardInfo>
      <CardActions>
        {isRunning ? (
          <>
            <Button variant="stop" onClick={() => onStop(container.Id)}>
              Stop
            </Button>
            <Button variant="restart" onClick={() => onRestart(container.Id)}>
              Restart
            </Button>
            <Button variant="shell" onClick={() => onShell(container.Id, name)}>
              Shell
            </Button>
            <Button variant="logs" onClick={() => onLogs(container.Id)}>
              Logs
            </Button>
            <Button variant="stats" onClick={() => onStats(container.Id)}>
              Stats
            </Button>
          </>
        ) : (
          <Button variant="start" onClick={() => onStart(container.Id)}>
            Start
          </Button>
        )}
        <Button variant="remove" onClick={() => onRemove(container.Id)}>
          Remove
        </Button>
      </CardActions>
    </Card>
  );
};
