import { Button } from '../common/Button';
import { formatBytes } from '../../utils/api';

export const ImageList = ({ images, onRun, onRemove }) => {
  return (
    <div className="list-container">
      <table className="list-table">
        <thead>
          <tr>
            <th>Tags</th>
            <th>ID</th>
            <th>Size</th>
            <th>Created</th>
            <th>Containers</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {images.map((img) => {
            const id = img.Id.replace('sha256:', '').substring(0, 12);
            const tags = img.RepoTags ? img.RepoTags.join(', ') : '<none>';
            const size = formatBytes(img.Size);
            const created = new Date(img.Created * 1000).toLocaleString();
            const containerCount = img.ContainerCount || 0;

            return (
              <tr key={img.Id}>
                <td><strong>{tags}</strong></td>
                <td><code>{id}</code></td>
                <td>{size}</td>
                <td>{created}</td>
                <td>{containerCount}</td>
                <td>
                  <div className="list-actions">
                    <Button variant="run" onClick={() => onRun(img.Id, tags)}>
                      Run
                    </Button>
                    <Button variant="remove" onClick={() => onRemove(img.Id)}>
                      Remove
                    </Button>
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
