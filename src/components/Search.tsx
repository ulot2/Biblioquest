import { Search as SearchIcon } from "lucide-react";

interface SearchProps {
  query: string;
  onSearch: (query: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const Search: React.FC<SearchProps> = ({
  query,
  onSearch,
  activeFilter,
  onFilterChange,
}) => {
  const filters = ["All", "Easy", "Medium", "Hard"];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      <div className="relative w-full md:flex-1">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search books..."
          className="w-full py-3 pl-10 pr-4 border-[1.5px] border-charcoal bg-charcoal rounded-lg focus:outline-none focus:border-muted-gray text-off-white placeholder-muted-gray transition-colors"
        />
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-4 md:px-6 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeFilter === filter
                ? "bg-off-white text-near-black"
                : "bg-charcoal text-muted-gray hover:bg-[#252830] hover:text-off-white"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};
