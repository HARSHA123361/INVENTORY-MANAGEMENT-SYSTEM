import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useGetTenantQuery, 
  useCreateTenantMutation, 
  useUpdateTenantMutation 
} from '../../api/tenantApi';
import { motion } from 'framer-motion';
import { ChevronLeft, Save, Building2, AlertCircle } from 'lucide-react';

export default function TenantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const { data: tenantData, isLoading: isFetchingDetails } = useGetTenantQuery(id, { skip: !isEdit });
  const [createTenant, { isLoading: isCreating }] = useCreateTenantMutation();
  const [updateTenant, { isLoading: isUpdating }] = useUpdateTenantMutation();

  const [formData, setFormData] = useState({ name: '', status: 'Active' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && tenantData?.data) {
      setFormData({
        name: tenantData.data.name,
        status: tenantData.data.status,
      });
    }
  }, [tenantData, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('Tenant Name is required');
      return;
    }

    try {
      if (isEdit) {
        await updateTenant({ id, ...formData }).unwrap();
      } else {
        await createTenant(formData).unwrap();
      }
      navigate('/tenants');
    } catch (err) {
      setError(err.data?.error || 'Something went wrong');
    }
  };

  const isLoading = isCreating || isUpdating;

  if (isEdit && isFetchingDetails) return (
    <div className="flex items-center justify-center p-12">
      <Building2 className="w-8 h-8 text-violet-600 animate-pulse" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/tenants')}
        className="group flex items-center gap-2 text-[#64748B] hover:text-violet-600 transition-colors font-semibold"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Tenants
      </button>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-violet-100 border border-violet-200 rounded-2xl flex items-center justify-center shadow-sm">
          <Building2 className="w-6 h-6 text-violet-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#1E293B] tracking-tight">
            {isEdit ? 'Edit Tenant' : 'Create New Tenant'}
          </h1>
          <p className="text-[#64748B] mt-1 font-medium">
            {isEdit ? 'Update organizational details and status.' : 'Define a new organizational scope.'}
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
          <Building2 size={160} className="text-violet-600" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#1E293B]">
              Tenant Name <span className="text-violet-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-[#9CA3AF] font-medium"
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#1E293B]">Status</label>
            <div className="relative">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer font-medium"
              >
                <option value="Active" className="bg-white">Active</option>
                <option value="Inactive" className="bg-white">Inactive</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronLeft className="w-4 h-4 rotate-[270deg]" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 btn-premium text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-5 h-5 text-white" />
              {isLoading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Tenant')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/tenants')}
              className="px-6 py-3 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] rounded-xl font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
