import { createSlice } from '@reduxjs/toolkit';

const tenantSlice = createSlice({
  name: 'tenant',
  initialState: {
    selectedTenantId: null,
    selectedTenantName: null,
  },
  reducers: {
    setSelectedTenant: (state, action) => {
      state.selectedTenantId = action.payload.id;
      state.selectedTenantName = action.payload.name;
    },
    clearSelectedTenant: (state) => {
      state.selectedTenantId = null;
      state.selectedTenantName = null;
    },
  },
});

export const { setSelectedTenant, clearSelectedTenant } = tenantSlice.actions;
export default tenantSlice.reducer;
