import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { RootState } from '../store';

// Types
interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// Base query with auth
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Base query with re-authentication
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Try to get a new token
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        body: {
          refreshToken: (api.getState() as RootState).auth.refreshToken,
        },
      },
      api,
      extraOptions
    );
    
    if (refreshResult.data) {
      const refreshData = refreshResult.data as RefreshResponse;
      
      // Store the new token
      api.dispatch({
        type: 'auth/setCredentials',
        payload: {
          token: refreshData.accessToken,
          refreshToken: refreshData.refreshToken,
        },
      });
      
      // Retry the original query
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, logout user
      api.dispatch({ type: 'auth/logout' });
    }
  }
  
  return result;
};

// Enhanced base query with error handling
const baseQueryWithErrorHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQueryWithReauth(args, api, extraOptions);
  
  // Global error handling
  if (result.error) {
    const { status, data } = result.error;
    
    // Handle specific error codes
    switch (status) {
      case 403:
        // Permission denied
        console.error('Access denied:', data);
        break;
      case 404:
        // Not found
        console.error('Resource not found:', data);
        break;
      case 429:
        // Rate limited
        console.error('Rate limited:', data);
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        console.error('Server error:', data);
        break;
      default:
        console.error('API error:', data);
    }
  }
  
  return result;
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    'User',
    'Transaction',
    'Budget',
    'Goal',
    'Category',
    'Analytics',
    'Report',
    'Bill',
    'Investment',
  ],
  endpoints: () => ({}),
});

export default baseApi;