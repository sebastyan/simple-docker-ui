import { Card, CardHeader, CardTitle, CardInfo, CardActions, InfoRow } from '../common/Card';
import { Button } from '../common/Button';
import { truncate } from '../../utils/text';

export const VolumeCard = ({ volume, onInspect, onRemove }) => {
  const name = volume.Name;
  const driver = volume.Driver;
  const mountpoint = volume.Mountpoint;
  const created = new Date(volume.CreatedAt).toLocaleString();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{truncate(name, 40)}</CardTitle>
      </CardHeader>
      <CardInfo>
        <InfoRow label="Driver" value={driver} />
        <InfoRow label="Mountpoint" value={truncate(mountpoint, 60)} />
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
