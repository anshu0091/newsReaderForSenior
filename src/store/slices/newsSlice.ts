import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchNewsAPI } from '../../services/newsService';

export interface NewsArticle {
  article_id: string;
  title: string;
  link: string;
  keywords: string[];
  creator: string[];
  description: string;
  content: string;
  pubDate: string;
  image_url: string | null;
  source_id: string;
  source_priority: number;
  country: string[];
  category: string[];
  language: string;
}

interface NewsState {
  articles: NewsArticle[];
  selectedArticle: NewsArticle | null;
  loading: boolean;
  error: string | null;
  totalResults: number;
  nextPage: string | null;
  seenArticleIds: string[]; // Changed from Set to array
}

const initialState: NewsState = {
  articles: [],
  selectedArticle: null,
  loading: false,
  error: null,
  totalResults: 0,
  nextPage: null,
  seenArticleIds: [], // Changed from Set to array
};

export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async ({ 
    q = '', 
    country = '', 
    category = '',
    language = 'en', 
    page = 0 
  }: { 
    q?: string; 
    country?: string; 
    category?: string;
    language?: string;
    page?: number;
  }) => {
    return await fetchNewsAPI(q, country, category, language, page);
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setSelectedArticle: (state, action: PayloadAction<NewsArticle | null>) => {
      state.selectedArticle = action.payload;
    },
    clearNews: (state) => {
      state.articles = [];
      state.nextPage = null;
      state.totalResults = 0;
      state.seenArticleIds = []; // Changed from Set clear to empty array
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        
        // For initial load or fresh search, reset seen articles
        if (action.meta.arg.page === 0) {
          state.articles = [];
          state.seenArticleIds = [];
        }
        
        // Filter out duplicates using the seenArticleIds array
        const newArticles = action.payload.results.filter(article => {
          if (state.seenArticleIds.includes(article.article_id)) {
            return false;
          }
          state.seenArticleIds.push(article.article_id);
          return true;
        });
        
        // Update articles array
        state.articles = [...state.articles, ...newArticles];
        state.totalResults = action.payload.totalResults;
        state.nextPage = action.payload.nextPage;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch news';
      });
  },
});

export const { setSelectedArticle, clearNews } = newsSlice.actions;
export default newsSlice.reducer;