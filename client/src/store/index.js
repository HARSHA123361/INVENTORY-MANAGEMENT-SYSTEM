import { configureStore } from '@reduxjs/toolkit';
import tenantReducer from './tenantSlice';
import { baseApi } from '../api/baseApi';

export const store = configureStore({
  reducer: {
    tenant: tenantReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});
