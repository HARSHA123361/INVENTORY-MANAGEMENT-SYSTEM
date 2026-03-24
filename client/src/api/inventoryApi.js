import { baseApi } from './baseApi';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query({
      query: (params = {}) => ({ url: '/inventory', params }),
      providesTags: ['Inventory'],
    }),
    getInventoryItem: builder.query({
      query: ({ id, tenant_id }) => ({
        url: `/inventory/${id}`,
        params: tenant_id ? { tenant_id } : undefined,
      }),
      providesTags: (r, e, { id }) => [{ type: 'Inventory', id }],
    }),
    updateInventory: builder.mutation({
      query: ({ id, tenant_id, quantity }) => ({
        url: `/inventory/${id}`,
        method: 'PUT',
        params: { tenant_id },
        body: { quantity },
      }),
      invalidatesTags: ['Inventory', 'Order'],
    }),
    deleteInventory: builder.mutation({
      query: ({ id, tenant_id }) => ({
        url: `/inventory/${id}`,
        method: 'DELETE',
        params: { tenant_id },
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetInventoryItemQuery,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
} = inventoryApi;
