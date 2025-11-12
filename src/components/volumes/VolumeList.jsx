import { ContextMenu } from '../common/ContextMenu';
import { truncate } from '../../utils/text';

const VolumeRow = ({ volume, onInspect, onRemove }) => {
  const name = volume.Name;
  const driver = volume.Driver;
  const mountpoint = volume.Mountpoint;
  const created = new Date(volume.CreatedAt).toLocaleString();

  return (
    <tr>
      <td><strong>{truncate(name, 30)}</strong></td>
      <td>{driver}</td>
      <td>{truncate(mountpoint, 50)}</td>
      <td>{created}</td>
      <td>
        <div className="list-actions">
          <ContextMenu
            items={[
              {
                label: 'Inspect',
                icon: 'ⓘ',
                onClick: () => onInspect(name)
              },
              {
                label: 'Remove',
                icon: '×',
                variant: 'danger',
                onClick: () => onRemove(name)
              }
            ]}
          />
        </div>
      </td>
    </tr>
  );
};

export const VolumeList = ({ volumes, onInspect, onRemove }) => {
  return (
    <div className="list-container">
      <table className="list-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Driver</th>
            <th>Mountpoint</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {volumes.map((v) => (
            <VolumeRow
              key={v.Name}
              volume={v}
              onInspect={onInspect}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
