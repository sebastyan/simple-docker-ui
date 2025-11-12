export const SearchBar = ({ value, onChange, placeholder }) => {
  return (
    <input
      type="text"
      className="search-input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
