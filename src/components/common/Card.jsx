export const Card = ({ children, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children }) => {
  return <div className="card-header">{children}</div>;
};

export const CardTitle = ({ children }) => {
  return <div className="card-title">{children}</div>;
};

export const CardInfo = ({ children }) => {
  return <div className="card-info">{children}</div>;
};

export const CardActions = ({ children }) => {
  return <div className="card-actions">{children}</div>;
};

export const InfoRow = ({ label, value }) => {
  return (
    <div className="info-row">
      <span className="info-label">{label}:</span>
      <span className="info-value">{value}</span>
    </div>
  );
};
