import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { fetchNews } from '../../store/slices/newsSlice';
import { Loader } from 'lucide-react';

const LoadMoreButton: React.FC = () => {
  const dispatch = useDispatch();
  const { loading, nextPage } = useSelector((state: RootState) => state.news);
  const { searchQuery, selectedCountry, selectedCategory } = useSelector(
    (state: RootState) => state.filter
  );

  const handleLoadMore = () => {
    if (nextPage) {
      dispatch(
        fetchNews({
          q: searchQuery,
          country: selectedCountry,
          category: selectedCategory,
          page: parseInt(nextPage)
        })
      );
    }
  };

  if (!nextPage) {
    return null;
  }

  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={handleLoadMore}
        disabled={loading}
        className="btn btn-secondary px-8 py-3 flex items-center space-x-2 disabled:opacity-50"
        aria-label={loading ? "Loading more articles..." : "Load more articles"}
      >
        {loading ? (
          <>
            <Loader size={20} className="animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <span>Load More Articles</span>
        )}
      </button>
    </div>
  );
};

export default LoadMoreButton;