import { baseApi } from './baseApi';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (params = {}) => ({ url: '/orders', params }),
      providesTags: ['Order'],
    }),
    getOrder: builder.query({
      query: ({ id, tenant_id }) => ({
        url: `/orders/${id}`,
        params: { tenant_id },
      }),
      providesTags: (r, e, { id }) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Order', 'Inventory'],
    }),
    updateOrder: builder.mutation({
      query: ({ id, tenant_id, ...body }) => ({
        url: `/orders/${id}`,
        method: 'PUT',
        body: { tenant_id, ...body },
      }),
      invalidatesTags: ['Order', 'Inventory'],
    }),
    deleteOrder: builder.mutation({
      query: ({ id, tenant_id }) => ({
        url: `/orders/${id}`,
        method: 'DELETE',
        params: { tenant_id },
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = orderApi;
