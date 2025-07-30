import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// API
import { authApi } from './api/authApi';
import { transactionsApi } from './api/transactionsApi';
import { budgetsApi } from './api/budgetsApi';
import { goalsApi } from './api/goalsApi';
import { categoriesApi } from './api/categoriesApi';
import { analyticsApi } from './api/analyticsApi';
import { reportsApi } from './api/reportsApi';

// Slices
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import transactionSlice from './slices/transactionSlice';
import budgetSlice from './slices/budgetSlice';
import goalSlice from './slices/goalSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'], // Only persist auth and UI state
  blacklist: [
    'authApi',
    'transactionsApi',
    'budgetsApi',
    'goalsApi',
    'categoriesApi',
    'analyticsApi',
    'reportsApi'
  ]
};

// Root reducer
const rootReducer = combineReducers({
  // API reducers
  [authApi.reducerPath]: authApi.reducer,
  [transactionsApi.reducerPath]: transactionsApi.reducer,
  [budgetsApi.reducerPath]: budgetsApi.reducer,
  [goalsApi.reducerPath]: goalsApi.reducer,
  [categoriesApi.reducerPath]: categoriesApi.reducer,
  [analyticsApi.reducerPath]: analyticsApi.reducer,
  [reportsApi.reducerPath]: reportsApi.reducer,
  
  // Feature slices
  auth: authSlice,
  ui: uiSlice,
  transactions: transactionSlice,
  budgets: budgetSlice,
  goals: goalSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['register'],
      },
    })
      .concat(authApi.middleware)
      .concat(transactionsApi.middleware)
      .concat(budgetsApi.middleware)
      .concat(goalsApi.middleware)
      .concat(categoriesApi.middleware)
      .concat(analyticsApi.middleware)
      .concat(reportsApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Setup listeners for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export default store
export default store;