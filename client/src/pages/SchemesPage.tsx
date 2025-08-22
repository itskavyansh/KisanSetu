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
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const navigate = useNavigate();

  const load = async (page = 1, searchQuery = q) => {
    setLoading(true);
    try {
      const params: any = { page };
      if (searchQuery) params.q = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;

      const r = await governmentSchemesAPI.searchSchemes(params);
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

  const loadCategories = async () => {
    try {
      const r = await governmentSchemesAPI.getCategories();
      setCategories(r.data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
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

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    load(1, q);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    load(1, q);
  };

  const clearFilters = () => {
    setQ('');
    setSelectedCategory('');
    setSelectedStatus('');
    setCurrentPage(1);
    load(1, '');
  };

  useEffect(() => { 
    load(); 
    loadCategories();
  }, []);

  // Auto-search when filters change
  useEffect(() => {
    if (selectedCategory || selectedStatus) {
      load(currentPage, q);
    }
  }, [selectedCategory, selectedStatus]);

  return (
    <div className="flex-1 overflow-auto relative min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Government Schemes</h1>
        <div className="text-sm text-gray-600">
          Powered by <a href="https://www.myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">myScheme.gov.in</a>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white border rounded-lg p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 flex-1"
            placeholder="Search schemes (e.g., irrigation, soil, subsidy)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch} 
            disabled={loading}
            className="bg-kisan-green text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-green-600"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select 
              className="border border-gray-300 rounded px-3 py-1 text-sm"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select 
              className="border border-gray-300 rounded px-3 py-1 text-sm"
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="ongoing">Ongoing</option>
              <option value="new">New</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          {(q || selectedCategory || selectedStatus) && (
            <button 
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      {totalResults > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {schemes.length} of {totalResults.toLocaleString()} schemes
            {q && ` for "${q}"`}
            {selectedCategory && ` in ${selectedCategory}`}
          </div>
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schemes Grid */}
      {!loading && schemes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schemes.map((s) => (
            <div key={s.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{s.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
                  s.status?.toLowerCase().includes('active') ? 'bg-green-100 text-green-700' :
                  s.status?.toLowerCase().includes('new') ? 'bg-blue-100 text-blue-700' :
                  s.status?.toLowerCase().includes('upcoming') ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {s.status || 'Active'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{s.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span className="bg-gray-100 px-2 py-1 rounded">{s.category || 'General'}</span>
                <span>Source: myScheme.gov.in</span>
              </div>
              
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => navigate(`/schemes/${s.id}`)} 
                  className="text-kisan-green hover:text-green-600 font-medium text-sm"
                >
                  View Details →
                </button>
                {s.url && (
                  <a 
                    href={s.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs underline"
                  >
                    Official Link
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && schemes.length === 0 && totalResults === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schemes found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters to find relevant schemes.
          </p>
          <button 
            onClick={clearFilters}
            className="bg-kisan-green text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Enhanced Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ← Previous
          </button>
          
          {/* Page Numbers */}
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 border rounded-lg text-sm ${
                    currentPage === pageNum 
                      ? 'bg-kisan-green text-white border-kisan-green' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t">
        <p>
          All scheme data is sourced from the official{' '}
          <a href="https://www.myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            myScheme.gov.in
          </a>{' '}
          portal maintained by the Government of India.
        </p>
        <p className="mt-1">
          For the most up-to-date information, please visit the official website.
        </p>
      </div>
    </div>
  );
};

export default SchemesPage;