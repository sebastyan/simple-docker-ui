import { Button } from '../common/Button';

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
          {volumes.map((v) => {
            const name = v.Name;
            const driver = v.Driver;
            const mountpoint = v.Mountpoint;
            const created = new Date(v.CreatedAt).toLocaleString();

            return (
              <tr key={name}>
                <td><strong>{name}</strong></td>
                <td>{driver}</td>
                <td>{mountpoint}</td>
                <td>{created}</td>
                <td>
                  <div className="list-actions">
                    <Button variant="stats" onClick={() => onInspect(name)}>
                      Inspect
                    </Button>
                    <Button variant="remove" onClick={() => onRemove(name)}>
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
