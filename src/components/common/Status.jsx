export const Status = ({ status }) => {
  return (
    <div className={`status ${status.toLowerCase()}`}>
      {status}
    </div>
  );
};
