import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchNews, clearNews } from '../../store/slices/newsSlice';
import { 
  setSearchQuery, 
  setSelectedCountry, 
  setSelectedCategory, 
  resetFilters 
} from '../../store/slices/filterSlice';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { countries, categories } from '../../services/newsService';
import debounce from 'lodash/debounce';

const NewsFilter: React.FC = () => {
  const dispatch = useDispatch();
  const { searchQuery, selectedCountry, selectedCategory } = useSelector(
    (state: RootState) => state.filter
  );
  
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      dispatch(setSearchQuery(query));
      dispatch(clearNews());
      dispatch(fetchNews({ 
        q: query, 
        country: selectedCountry, 
        category: selectedCategory 
      }));
    }, 500),
    [dispatch, selectedCountry, selectedCategory]
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    debouncedSearch(query);
  };
  
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    dispatch(setSelectedCountry(country));
    dispatch(clearNews());
    dispatch(fetchNews({ 
      q: searchQuery, 
      country, 
      category: selectedCategory 
    }));
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    dispatch(setSelectedCategory(category));
    dispatch(clearNews());
    dispatch(fetchNews({ 
      q: searchQuery, 
      country: selectedCountry, 
      category 
    }));
  };
  
  const handleReset = () => {
    setLocalSearchQuery('');
    dispatch(resetFilters());
    dispatch(clearNews());
    dispatch(fetchNews({}));
  };
  
  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search input */}
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-500" />
            </div>
            <input
              type="text"
              className="form-input pl-10 w-full"
              placeholder="Search for news..."
              value={localSearchQuery}
              onChange={handleSearchChange}
              aria-label="Search for news"
            />
          </div>
          
          {/* Filter Toggle button */}
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary flex items-center gap-2"
              onClick={toggleFilters}
              aria-expanded={isFiltersOpen}
              aria-controls="filter-options"
            >
              <Filter size={20} />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown 
                size={16} 
                className={`transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} 
              />
            </button>
          </div>
        </div>
        
        {/* Filter options */}
        {isFiltersOpen && (
          <div 
            id="filter-options"
            className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200"
          >
            {/* Country filter */}
            <div>
              <label htmlFor="country-filter" className="form-label">
                Country
              </label>
              <select
                id="country-filter"
                className="form-input"
                value={selectedCountry}
                onChange={handleCountryChange}
                aria-label="Filter by country"
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Category filter */}
            <div>
              <label htmlFor="category-filter" className="form-label">
                Category
              </label>
              <select
                id="category-filter"
                className="form-input"
                value={selectedCategory}
                onChange={handleCategoryChange}
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.code} value={category.code}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Reset button */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="button"
                className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
                onClick={handleReset}
                aria-label="Reset all filters"
              >
                <X size={16} className="mr-1" />
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFilter;