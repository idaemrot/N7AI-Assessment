interface CategoryFilterProps {
  /** All unique category strings derived from the loaded documents. */
  categories: string[];
  /** The currently selected category, or 'All' for no filter. */
  selected: string;
  onChange: (category: string) => void;
}

const ALL = 'All';

/**
 * A simple row of filter buttons — one per category plus an "All" button.
 * No external library required; plain buttons with active state styling.
 */
export default function CategoryFilter({
  categories,
  selected,
  onChange,
}: CategoryFilterProps) {
  const options = [ALL, ...categories];

  return (
    <div className="category-filter" role="group" aria-label="Filter by category">
      {options.map((cat) => (
        <button
          key={cat}
          id={`filter-${cat.toLowerCase()}`}
          className={`filter-btn${selected === cat ? ' filter-btn--active' : ''}`}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
