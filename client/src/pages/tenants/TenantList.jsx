import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTenantsQuery, useDeleteTenantMutation } from '../../api/tenantApi';
import StatusBadge from '../../components/shared/StatusBadge';
import Pagination from '../../components/shared/Pagination';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { motion } from 'framer-motion';
import { Plus, Search, Users, Activity, SlidersHorizontal, Trash2, Eye, Edit } from 'lucide-react';

export default function TenantList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching } = useGetTenantsQuery({ search, sort, page, limit: 10 });
  const [deleteTenant] = useDeleteTenantMutation();

  const rows = data?.data?.rows || [];
  const stats = data?.data?.stats || {};
  const total = data?.meta?.total || 0;

  const handleDelete = async () => {
    await deleteTenant(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Tenants</h1>
          <p className="text-[#64748B] mt-1 font-medium">Manage organizational scopes and data isolation.</p>
        </div>
        <button
          onClick={() => navigate('/tenants/new')}
          className="flex items-center gap-2 btn-premium text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-white" />
          New Tenant
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Tenants', value: stats.total || 0, icon: Users, color: 'indigo' },
          { label: 'Active', value: stats.active || 0, icon: Activity, color: 'emerald' },
          { label: 'Inactive', value: stats.inactive || 0, icon: SlidersHorizontal, color: 'rose' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="glass-card p-6 border border-[#E2E8F0] relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity`}>
              <stat.icon size={80} className={`text-${stat.color}-600`} />
            </div>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#64748B] tracking-wide">{stat.label}</p>
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
              placeholder="Filter tenants..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] w-full focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-[#9CA3AF]"
            />
          </div>
          <div className="flex items-center gap-3 bg-white border border-[#E2E8F0] px-4 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-[#64748B]">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-bold text-violet-600 cursor-pointer"
            >
              <option value="name">Name (A-Z)</option>
              <option value="status">Status</option>
              <option value="created_at">Date Created</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] text-[#64748B] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Tenant name</th>
                <th className="px-6 py-4">Tenant ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading || isFetching ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-[#64748B] animate-pulse font-medium">Fetching records...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-[#64748B] font-medium">No tenants matched your criteria</td></tr>
              ) : rows.map((t, i) => (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={t.id}
                  className="group hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  onClick={() => navigate(`/tenants/${t.id}`)}
                >
                  <td className="px-6 py-4 font-bold text-[#1E293B]">{t.name}</td>
                  <td className="px-6 py-4 text-xs font-mono text-[#64748B] group-hover:text-violet-600 transition-colors">
                    {t.id}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/tenants/${t.id}`)} 
                        className="p-2 bg-violet-50 hover:bg-violet-100 rounded-lg text-violet-600 transition-all shadow-sm border border-violet-100" 
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => navigate(`/tenants/${t.id}/edit`)} 
                        className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-[#64748B] hover:text-[#1E293B] transition-all shadow-sm border border-[#E2E8F0]" 
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteTarget(t)} 
                        className="p-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-600 transition-all shadow-sm border border-rose-100" 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-white/[0.01]">
          <Pagination page={page} total={total} limit={10} onPageChange={setPage} />
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Tenant"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
