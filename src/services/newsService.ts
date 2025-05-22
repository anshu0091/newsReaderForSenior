const API_KEY = 'pub_38a841c1f4f6409fb0959c5146d235b1';
const BASE_URL = 'https://newsdata.io/api/1/news';

interface NewsResponse {
  status: string;
  totalResults: number;
  results: NewsArticle[];
  nextPage: string | null;
}

interface CacheItem {
  data: NewsResponse;
  timestamp: number;
}

class NewsCache {
  private cache: Map<string, CacheItem>;
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
  private seenArticleIds: Set<string>;

  constructor() {
    this.cache = new Map();
    this.seenArticleIds = new Set();
  }

  private generateCacheKey(params: Record<string, string>): string {
    return Object.entries(params)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
  }

  get(params: Record<string, string>): NewsResponse | null {
    const key = this.generateCacheKey(params);
    const cached = this.cache.get(key);

    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(params: Record<string, string>, data: NewsResponse): void {
    const key = this.generateCacheKey(params);
    
    // Filter out any duplicates before caching
    const uniqueResults = data.results.filter(article => {
      if (this.seenArticleIds.has(article.article_id)) {
        return false;
      }
      this.seenArticleIds.add(article.article_id);
      return true;
    });

    this.cache.set(key, {
      data: {
        ...data,
        results: uniqueResults,
        totalResults: uniqueResults.length,
      },
      timestamp: Date.now(),
    });

    // Clean up old cache entries
    this.cleanup();
  }

  clearSeen(): void {
    this.seenArticleIds.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

const newsCache = new NewsCache();

export const fetchNewsAPI = async (
  q: string = '',
  country: string = '',
  category: string = '',
  language: string = 'en',
  page: number = 0
): Promise<NewsResponse> => {
  const params = { q, country, category, language, page: page.toString() };
  
  // Reset seen articles on new search
  if (page === 0) {
    newsCache.clearSeen();
  }
  
  // Check cache first
  const cachedData = newsCache.get(params);
  if (cachedData) {
    return cachedData;
  }

  try {
    let url = `${BASE_URL}?apikey=${API_KEY}&language=${language}`;
    
    if (q) url += `&q=${encodeURIComponent(q)}`;
    if (country) url += `&country=${country}`;
    if (category) url += `&category=${category}`;
    
    // For pagination
    if (page > 0) {
      url += `&page=${page}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    const newsResponse = {
      status: data.status,
      totalResults: data.totalResults || 0,
      results: data.results || [],
      nextPage: data.nextPage || null,
    };

    // Cache the response
    newsCache.set(params, newsResponse);
    
    return newsResponse;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

// Countries supported by the API
export const countries = [
  { code: 'au', name: 'Australia' },
  { code: 'ca', name: 'Canada' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'in', name: 'India' },
  { code: 'us', name: 'United States' },
  { code: 'za', name: 'South Africa' },
];

// Categories supported by the API
export const categories = [
  { code: 'business', name: 'Business' },
  { code: 'entertainment', name: 'Entertainment' },
  { code: 'environment', name: 'Environment' },
  { code: 'food', name: 'Food' },
  { code: 'health', name: 'Health' },
  { code: 'politics', name: 'Politics' },
  { code: 'science', name: 'Science' },
  { code: 'sports', name: 'Sports' },
  { code: 'technology', name: 'Technology' },
  { code: 'top', name: 'Top News' },
  { code: 'world', name: 'World' },
];