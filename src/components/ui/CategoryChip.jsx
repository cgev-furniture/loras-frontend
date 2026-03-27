export default function CategoryChip({ category, label, active, onClick }) {
  // Support both `category` (object with .name) and legacy `label` (string)
  const displayLabel = label ?? (typeof category === 'string' ? category : category?.name);
  return (
    <button
      type="button"
      className="chip"
      aria-pressed={!!active}
      onClick={onClick}
    >
      {displayLabel}
    </button>
  );
}
