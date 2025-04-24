import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import IconGrid from '@/components/IconGrid';
import Footer from '@/components/Footer';
import { debounce, prefetchCriticalResources } from '@/utils/optimize';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [icons, setIcons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subcategories, setSubcategories] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalIcons, setTotalIcons] = useState(0);
  const [pageSize, setPageSize] = useState(48);
  
  // Sorting state
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Prefetch critical resources when component mounts
  useEffect(() => {
    prefetchCriticalResources();
  }, []);

  // Categories based on PRD
  const categories = [
    'all', 'arrows', 'commerce', 'culture', 'education', 'entertainment', 
    'essentials', 'office', 'social', 'technology', 'tools', 'travel'
  ];

  // Fetch icons function
  const fetchIcons = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const url = new URL('/api/icons', window.location.origin);
      if (searchQuery) url.searchParams.append('q', searchQuery);
      if (activeCategory !== 'all') url.searchParams.append('category', activeCategory);
      if (activeSubcategory) url.searchParams.append('subcategory', activeSubcategory);
      
      // Add pagination params
      url.searchParams.append('page', page);
      url.searchParams.append('limit', pageSize);
      
      // Add sorting params
      url.searchParams.append('sortBy', sortBy);
      url.searchParams.append('sortOrder', sortOrder);
      
      // Use performance API to measure fetch time
      const fetchStart = performance.now();
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch icons');
      
      const data = await response.json();
      
      // Log fetch performance
      const fetchEnd = performance.now();
      console.debug(`Fetched ${data.icons.length} icons in ${(fetchEnd - fetchStart).toFixed(2)}ms`);
      
      setIcons(data.icons);
      setTotalIcons(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.currentPage);
      
      // Extract subcategories from the data if a category is selected
      if (activeCategory !== 'all') {
        // Use API data if available, otherwise fallback to local calculation
        if (data.icons.length > 0) {
          const uniqueSubcategories = [...new Set(
            data.icons
              .filter(icon => icon.category === activeCategory && icon.subcategory)
              .map(icon => icon.subcategory)
          )].sort();
          setSubcategories(uniqueSubcategories);
        } else {
          setSubcategories([]);
        }
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error('Error fetching icons:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeCategory, activeSubcategory, pageSize, sortBy, sortOrder]);

  // Use debounce for search queries
  const debouncedFetchIcons = useCallback(
    debounce((page) => fetchIcons(page), 300),
    [fetchIcons]
  );

  // Fetch icons when search, category, subcategory, or pagination/sorting changes
  useEffect(() => {
    // Reset to page 1 when search criteria change
    debouncedFetchIcons(1);
  }, [searchQuery, activeCategory, activeSubcategory, pageSize, sortBy, sortOrder, debouncedFetchIcons]);

  // Reset subcategory when changing category
  useEffect(() => {
    setActiveSubcategory(null);
  }, [activeCategory]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchIcons(newPage);
      
      // Scroll to top of results
      window.scrollTo({
        top: document.getElementById('results-top').offsetTop - 20,
        behavior: 'smooth'
      });
    }
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value.includes('-')) {
      const [newSortBy, newSortOrder] = value.split('-');
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>Sarvārth Icon Library</title>
        <meta name="description" content="Browse and download icons from the comprehensive Sarvārth Icon Library" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Performance optimizations */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Cache control */}
        <meta httpEquiv="Cache-Control" content="public, max-age=31536000, immutable" />
      </Head>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-heading font-semibold text-center mb-4">Sarvārth Icon Library</h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          Created with ❤️ by{' '}
          <a 
            href="https://linkedin.com/in/vinaythoke" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            Vinay Thoke
          </a>
        </p>
        
        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search icons by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-md ${
                  activeCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory Filters */}
        {subcategories.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm text-gray-500 text-center mb-2">Subcategories</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                className={`px-3 py-1 text-sm rounded-md ${
                  activeSubcategory === null
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveSubcategory(null)}
              >
                All
              </button>
              {subcategories.map((subcategory) => (
                <button
                  key={subcategory}
                  className={`px-3 py-1 text-sm rounded-md ${
                    activeSubcategory === subcategory
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveSubcategory(subcategory)}
                >
                  {subcategory.split('/').pop().charAt(0).toUpperCase() + subcategory.split('/').pop().slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sort controls */}
        <div className="flex justify-between items-center mb-4">
          <div id="results-top" className="text-sm text-gray-500">
            {totalIcons} {totalIcons === 1 ? 'icon' : 'icons'} found
          </div>
          
          <div>
            <select 
              value={`${sortBy}-${sortOrder}`}
              onChange={handleSortChange}
              className="px-3 py-1 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="category-asc">Category (A-Z)</option>
              <option value="category-desc">Category (Z-A)</option>
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Icon Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <IconGrid icons={icons} />
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="First page"
                >
                  ≪
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="Previous page"
                >
                  ←
                </button>
                
                <span className="text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="Next page"
                >
                  →
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="Last page"
                >
                  ≫
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
} 