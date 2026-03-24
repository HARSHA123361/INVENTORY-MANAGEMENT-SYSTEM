import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetProductsQuery, useDeleteProductMutation } from '../../api/productApi';
import StatusBadge from '../../components/shared/StatusBadge';
import Pagination from '../../components/shared/Pagination';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import TenantDropdown from '../../components/shared/TenantDropdown';
import ActionMenu from '../../components/shared/ActionMenu';
import { motion } from 'framer-motion';
import { Plus, Search, Package, Layers, AlertTriangle, Filter, ArrowUpDown } from 'lucide-react';

export default function ProductList() {
  const navigate = useNavigate();
  const selectedTenantId = useSelector((state) => state.tenant.selectedTenantId);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching } = useGetProductsQuery(
    { tenant_id: selectedTenantId, search, sort, page, limit: 10 },
    { skip: !selectedTenantId }
  );

  const [deleteProduct] = useDeleteProductMutation();

  const rows = data?.data?.rows || [];
  const stats = data?.data?.stats || {};
  const total = data?.meta?.total || 0;

  useEffect(() => {
    setPage(1);
  }, [selectedTenantId]);

  const handleDelete = async () => {
    await deleteProduct({ id: deleteTarget.id, tenant_id: selectedTenantId });
    setDeleteTarget(null);
  };

  if (!selectedTenantId) {
    return (
      <div className="flex flex-col items-center justify-center p-20 glass-card border-[#E2E8F0] space-y-6">
        <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center">
          <Filter className="w-8 h-8 text-violet-600" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-[#1E293B]">Select a tenant</h2>
          <p className="text-[#64748B] font-medium">Choose an organization to load products.</p>
          <TenantDropdown />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Product catalog</h1>
          <p className="text-[#64748B] mt-1 font-medium">Manage catalog items for the selected tenant.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <TenantDropdown />
          <button
            type="button"
            onClick={() => navigate('/products/new')}
            className="flex items-center gap-2 btn-premium text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-white" />
            Add product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total products', value: stats.total || 0, icon: Package, color: 'indigo' },
          { label: 'Categories', value: stats.categories || 0, icon: Layers, color: 'violet' },
          { label: 'Low stock items', value: stats.lowStock || 0, icon: AlertTriangle, color: 'rose' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="glass-card p-6 border-[#E2E8F0] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
              <stat.icon size={80} className="text-violet-600" />
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-violet-500/10 text-violet-600">
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-[#1E293B] mt-0.5">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card border border-[#E2E8F0] overflow-hidden">
        <div className="p-6 border-b border-[#F1F5F9] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#F8FAFC]">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-[#64748B] w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] w-full focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3 bg-white border border-[#E2E8F0] px-4 py-1.5 rounded-xl">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-black text-violet-600 cursor-pointer"
            >
              <option value="name" className="bg-white">
                Name
              </option>
              <option value="sku" className="bg-white">
                SKU
              </option>
              <option value="category" className="bg-white">
                Category
              </option>
              <option value="status" className="bg-white">
                Status
              </option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] text-[#64748B] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#64748B] animate-pulse font-medium">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#64748B] font-medium">
                    No products for this tenant.
                  </td>
                </tr>
              ) : (
                rows.map((p, i) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={p.id}
                    className="group hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 font-black text-xs">
                          {p.name.charAt(0)}
                        </div>
                        <button
                          type="button"
                          className="font-bold text-[#1E293B] text-left hover:text-violet-600"
                          onClick={() => navigate(`/products/${p.id}`)}
                        >
                          {p.name}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-[#64748B] uppercase">{p.sku}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 font-bold uppercase tracking-wider border border-violet-100">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionMenu
                        actions={[
                          { label: 'View', onClick: () => navigate(`/products/${p.id}`) },
                          { label: 'Edit', onClick: () => navigate(`/products/${p.id}/edit`) },
                          { label: 'Delete', onClick: () => setDeleteTarget(p), danger: true },
                        ]}
                      />
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-[#F8FAFC]">
          <Pagination page={page} total={total} limit={10} onPageChange={setPage} />
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete product"
        message={`Remove "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
