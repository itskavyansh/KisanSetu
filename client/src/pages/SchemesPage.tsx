import React, { useEffect, useState } from 'react';
import { governmentSchemesAPI } from '../services/governmentSchemesService';
import { useNavigate } from 'react-router-dom';

const SchemesPage: React.FC = () => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async (page = 1, searchQuery = q) => {
    setLoading(true);
    try {
      const r = await governmentSchemesAPI.searchSchemes({ 
        ...(searchQuery ? { q: searchQuery } : {}),
        page 
      });
      setSchemes(r.data.schemes || []);
      setCurrentPage(r.data.pagination?.currentPage || 1);
      setTotalPages(r.data.pagination?.totalPages || 1);
      setTotalResults(r.data.pagination?.totalResults || 0);
    } catch (error) {
      console.error('Failed to load schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    load(1, q);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    load(page, q);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="flex-1 overflow-auto relative min-h-screen p-6 space-y-6">
      <h1 className="text-2xl font-bold">Government Schemes</h1>
      
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          className="border border-gray-300 rounded-lg px-4 py-2 flex-1"
          placeholder="Search schemes (e.g., irrigation, soil)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          onClick={handleSearch} 
          disabled={loading}
          className="bg-kisan-green text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results Info */}
      {totalResults > 0 && (
        <div className="text-sm text-gray-600">
          Showing {schemes.length} of {totalResults} schemes
        </div>
      )}

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {schemes.map((s) => (
          <div key={s.id} className="bg-white border rounded-lg p-4">
            <div className="font-semibold">{s.name}</div>
            <div className="text-sm text-gray-600 mt-1">{s.description}</div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">{s.status}</span>
              <button onClick={() => navigate(`/schemes/${s.id}`)} className="text-kisan-blue">Details</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 border rounded-lg ${
                currentPage === page 
                  ? 'bg-kisan-green text-white' 
                  : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* No Results */}
      {schemes.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          No schemes found. Try a different search term.
        </div>
      )}
    </div>
  );
};

export default SchemesPage;