import { Card, CardHeader, CardTitle, CardInfo, CardActions, InfoRow } from '../common/Card';
import { Button } from '../common/Button';
import { formatBytes } from '../../utils/api';

export const ImageCard = ({ image, onRun, onRemove }) => {
  const id = image.Id.replace('sha256:', '').substring(0, 12);
  const tags = image.RepoTags ? image.RepoTags.join(', ') : '<none>';
  const size = formatBytes(image.Size);
  const created = new Date(image.Created * 1000).toLocaleString();
  const containerCount = image.ContainerCount || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tags}</CardTitle>
      </CardHeader>
      <CardInfo>
        <InfoRow label="ID" value={id} />
        <InfoRow label="Size" value={size} />
        <InfoRow label="Created" value={created} />
        <InfoRow
          label="Containers"
          value={`${containerCount} ${containerCount === 1 ? 'container' : 'containers'}`}
        />
      </CardInfo>
      <CardActions>
        <Button variant="run" onClick={() => onRun(image.Id, tags)}>
          Run
        </Button>
        <Button variant="remove" onClick={() => onRemove(image.Id)}>
          Remove
        </Button>
      </CardActions>
    </Card>
  );
};
