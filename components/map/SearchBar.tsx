import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: () => void;
  isLoadingRoute: boolean;
}

export default function SearchBar({ searchTerm, setSearchTerm, onSearch, isLoadingRoute }: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch();
    }
  };

  const handleSearchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-[1000] w-72 sm:w-80 md:w-96">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for a location..."
          className="w-full pl-10 pr-12 py-3 rounded-lg shadow-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-card/90 backdrop-blur-sm border border-orange-200 dark:border-orange-300/20 text-foreground placeholder:text-muted-foreground transition-all duration-200"
        />
        <button 
          onClick={handleSearchClick} 
          type="button"
          disabled={isLoadingRoute}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 disabled:from-orange-300 disabled:to-orange-400 dark:disabled:from-orange-600 dark:disabled:to-orange-700 text-white px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center disabled:cursor-not-allowed"
          title={isLoadingRoute ? "Loading route..." : "Search"}
        >
          {isLoadingRoute ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
        </button>
      </div>
    </div>
  );
}