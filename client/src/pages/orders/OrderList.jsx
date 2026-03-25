import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetOrdersQuery, useDeleteOrderMutation } from '../../api/orderApi';
import StatusBadge from '../../components/shared/StatusBadge';
import Pagination from '../../components/shared/Pagination';
import TenantDropdown from '../../components/shared/TenantDropdown';
import ActionMenu from '../../components/shared/ActionMenu';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Plus, Hash, Calendar, Filter } from 'lucide-react';
import { formatDate } from '../../utils/date';

export default function OrderList() {
  const navigate = useNavigate();
  const selectedTenantId = useSelector((state) => state.tenant.selectedTenantId);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching } = useGetOrdersQuery(
    { tenant_id: selectedTenantId, search, page, limit: 10 },
    { skip: !selectedTenantId }
  );

  const [deleteOrder] = useDeleteOrderMutation();

  const rows = data?.data?.rows || [];
  const stats = data?.data?.stats || {};
  const total = data?.meta?.total || 0;

  useEffect(() => {
    setPage(1);
  }, [selectedTenantId]);

  const handleDelete = async () => {
    await deleteOrder({ id: deleteTarget.id, tenant_id: selectedTenantId });
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
          <p className="text-[#64748B] font-medium">Choose an organization to view orders.</p>
          <TenantDropdown />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Orders</h1>
          <p className="text-[#64748B] mt-1 font-medium">Orders for the selected tenant.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <TenantDropdown />
          <button
            type="button"
            onClick={() => navigate('/orders/new')}
            className="flex items-center gap-2 btn-premium text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-white" />
            Create order
          </button>
        </div>
      </div>

      <div className="glass-card p-2 border-[#E2E8F0] overflow-hidden grid grid-cols-2 lg:grid-cols-4 gap-2 bg-[#F8FAFC]">
        {[
          { label: 'Total', value: stats.total ?? 0 },
          { label: 'Created', value: stats.created ?? 0 },
          { label: 'Pending', value: stats.pending ?? 0 },
          { label: 'Cancelled', value: stats.cancelled ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white shadow-sm rounded-2xl border border-[#E2E8F0]">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-violet-600">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card border border-[#E2E8F0] overflow-hidden">
        <div className="p-6 border-b border-[#F1F5F9] bg-[#F8FAFC] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-[#64748B] w-4 h-4" />
            <input
              type="text"
              placeholder="Search order ID, product, or SKU…"
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
              <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] text-[10px] text-[#64748B] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4 text-center">Quantity</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Date</th>
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
                    No orders for this tenant.
                  </td>
                </tr>
              ) : (
                rows.map((order, i) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={order.id}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                        <span className="text-xs font-mono font-bold text-[#1E293B]">{order.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[#1E293B]">{order.product_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-[#1E293B]">{order.quantity}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-center text-[#64748B] text-xs font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="w-3 h-3 text-violet-600 shrink-0" />
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionMenu
                        actions={[
                          { label: 'View', onClick: () => navigate(`/orders/${order.id}`) },
                          { label: 'Edit', onClick: () => navigate(`/orders/${order.id}/edit`) },
                          {
                            label: 'Delete',
                            onClick: () => setDeleteTarget(order),
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
        title="Delete order"
        message="Remove this order permanently?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
