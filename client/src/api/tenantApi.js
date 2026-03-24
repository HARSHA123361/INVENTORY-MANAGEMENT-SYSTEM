import { baseApi } from './baseApi';

export const tenantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTenants: builder.query({
      query: (params = {}) => ({ url: '/tenants', params }),
      providesTags: ['Tenant'],
    }),
    getTenant: builder.query({
      query: (id) => `/tenants/${id}`,
      providesTags: (r, e, id) => [{ type: 'Tenant', id }],
    }),
    createTenant: builder.mutation({
      query: (body) => ({ url: '/tenants', method: 'POST', body }),
      invalidatesTags: ['Tenant'],
    }),
    updateTenant: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/tenants/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Tenant'],
    }),
    deleteTenant: builder.mutation({
      query: (id) => ({ url: `/tenants/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Tenant'],
    }),
  }),
});

export const {
  useGetTenantsQuery,
  useGetTenantQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
} = tenantApi;
