export const ViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="view-toggle">
      <button
        className={`view-btn ${view === 'cards' ? 'active' : ''}`}
        onClick={() => onViewChange('cards')}
        title="Card View"
      >
        <span>⊞</span>
      </button>
      <button
        className={`view-btn ${view === 'list' ? 'active' : ''}`}
        onClick={() => onViewChange('list')}
        title="List View"
      >
        <span>☰</span>
      </button>
    </div>
  );
};
