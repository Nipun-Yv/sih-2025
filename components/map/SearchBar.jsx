import { Search } from 'lucide-react';

export default function SearchBar({ searchTerm, setSearchTerm, onSearch }) {
  return (
    <div className="absolute top-4 left-4 z-[1000] w-80">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter') onSearch(); }}
          placeholder="Search for a city..."
          className="w-full pl-10 pr-12 py-3 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white/90"
        />
        <button onClick={onSearch} title="Search" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow">
          <Search size={16} />
        </button>
      </div>
    </div>
  );
}