import { baseApi } from './baseApi';

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params = {}) => ({ url: '/products', params }),
      providesTags: ['Product'],
    }),
    getActiveProducts: builder.query({
      query: ({ tenant_id }) => ({
        url: '/products/active',
        params: { tenant_id },
      }),
      transformResponse: (response) => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (Array.isArray(response.data)) return response.data;
        return [];
      },
      providesTags: ['Product'],
    }),
    getProduct: builder.query({
      query: ({ id, tenant_id }) => ({
        url: `/products/${id}`,
        params: { tenant_id },
      }),
      providesTags: (r, e, { id }) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: ['Product', 'Inventory'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, tenant_id, ...body }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        params: { tenant_id },
        body,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: ({ id, tenant_id }) => ({
        url: `/products/${id}`,
        method: 'DELETE',
        params: { tenant_id },
      }),
      invalidatesTags: ['Product', 'Inventory'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetActiveProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
