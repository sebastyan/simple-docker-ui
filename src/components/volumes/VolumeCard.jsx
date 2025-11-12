import { Card, CardHeader, CardTitle, CardInfo, CardActions, InfoRow } from '../common/Card';
import { Button } from '../common/Button';

export const VolumeCard = ({ volume, onInspect, onRemove }) => {
  const name = volume.Name;
  const driver = volume.Driver;
  const mountpoint = volume.Mountpoint;
  const created = new Date(volume.CreatedAt).toLocaleString();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardInfo>
        <InfoRow label="Driver" value={driver} />
        <InfoRow label="Mountpoint" value={mountpoint} />
        <InfoRow label="Created" value={created} />
      </CardInfo>
      <CardActions>
        <Button variant="stats" onClick={() => onInspect(name)}>
          Inspect
        </Button>
        <Button variant="remove" onClick={() => onRemove(name)}>
          Remove
        </Button>
      </CardActions>
    </Card>
  );
};
