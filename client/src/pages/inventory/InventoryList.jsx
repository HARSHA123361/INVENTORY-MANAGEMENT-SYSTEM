import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetInventoryQuery, useDeleteInventoryMutation } from '../../api/inventoryApi';
import Pagination from '../../components/shared/Pagination';
import TenantDropdown from '../../components/shared/TenantDropdown';
import ActionMenu from '../../components/shared/ActionMenu';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { motion } from 'framer-motion';
import { Search, Package, TrendingDown, Filter } from 'lucide-react';

function formatMoney(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(v);
}

export default function InventoryList() {
  const navigate = useNavigate();
  const selectedTenantId = useSelector((state) => state.tenant.selectedTenantId);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching } = useGetInventoryQuery(
    { tenant_id: selectedTenantId, search, page, limit: 10 },
    { skip: !selectedTenantId }
  );

  const [deleteInventory] = useDeleteInventoryMutation();

  const rows = data?.data?.rows || [];
  const stats = data?.data?.stats || {};
  const total = data?.meta?.total || 0;

  useEffect(() => {
    setPage(1);
  }, [selectedTenantId]);

  const handleDelete = async () => {
    await deleteInventory({ id: deleteTarget.id, tenant_id: selectedTenantId });
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
          <p className="text-[#64748B] font-medium">Choose an organization to view inventory.</p>
          <TenantDropdown />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Inventory</h1>
          <p className="text-[#64748B] mt-1 font-medium">Stock levels for the selected tenant.</p>
        </div>
        <TenantDropdown />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 rounded-3xl flex items-center gap-6 border-l-4 border-l-violet-600 shadow-sm"
        >
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 shadow-sm">
            <Package size={32} />
          </div>
          <div>
            <p className="text-sm font-black text-[#64748B] uppercase tracking-wider">Total SKUs</p>
            <p className="text-3xl font-black text-[#1E293B] mt-1">{stats.totalItems ?? 0}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-3xl flex items-center gap-6 border-l-4 border-l-rose-600 shadow-sm"
        >
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm">
            <TrendingDown size={32} />
          </div>
          <div>
            <p className="text-sm font-black text-[#64748B] uppercase tracking-wider">At or below reorder</p>
            <p className="text-3xl font-black text-rose-600 mt-1">{stats.lowStockItems ?? 0}</p>
          </div>
        </motion.div>
      </div>

      <div className="glass-card border border-[#E2E8F0] overflow-hidden">
        <div className="p-6 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-[#64748B] w-4 h-4" />
            <input
              type="text"
              placeholder="Filter by product or SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] w-full focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] text-[#64748B] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Product name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4 text-right">Cost per unit</th>
                <th className="px-6 py-4 text-center">Current inventory</th>
                <th className="px-6 py-4 text-center">Reorder threshold</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#64748B] animate-pulse font-medium">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#64748B] font-medium">
                    No inventory rows for this tenant.
                  </td>
                </tr>
              ) : (
                rows.map((item, i) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={item.id}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-[#1E293B]">{item.product_name}</td>
                    <td className="px-6 py-4 text-xs font-mono text-[#64748B]">{item.sku}</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-[#1E293B]">
                      {formatMoney(item.cost_per_unit)}
                    </td>
                    <td className="px-6 py-4 text-center font-black text-[#1E293B]">{item.quantity}</td>
                    <td className="px-6 py-4 text-center text-sm text-[#64748B] font-bold">
                      {item.reorder_threshold}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionMenu
                        actions={[
                          { label: 'View', onClick: () => navigate(`/inventory/${item.id}`) },
                          { label: 'Edit', onClick: () => navigate(`/inventory/${item.id}`) },
                          {
                            label: 'Delete',
                            onClick: () => setDeleteTarget(item),
                            danger: true,
                          },
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
        title="Delete inventory row"
        message={`Remove stock tracking for "${deleteTarget?.product_name}"? The product remains in the catalog.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
