import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  useGetProductQuery, 
  useCreateProductMutation, 
  useUpdateProductMutation 
} from '../../api/productApi';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Save,
  Package,
  AlertCircle,
  Hash,
  Tag,
  LayoutGrid,
  Info,
  DollarSign,
} from 'lucide-react';
import TenantDropdown from '../../components/shared/TenantDropdown';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';
  const selectedTenantId = useSelector((state) => state.tenant.selectedTenantId);

  const { data: productData, isLoading: isFetchingDetails } = useGetProductQuery(
    { id, tenant_id: selectedTenantId },
    { skip: !isEdit || !selectedTenantId }
  );
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    reorder_threshold: 0,
    cost_per_unit: 0,
    status: 'Active',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && productData?.data) {
      setFormData({
        sku: productData.data.sku,
        name: productData.data.name,
        category: productData.data.category,
        reorder_threshold: productData.data.reorder_threshold,
        cost_per_unit: productData.data.cost_per_unit,
        status: productData.data.status,
      });
    }
  }, [productData, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isEdit) {
        await updateProduct({ id, tenant_id: selectedTenantId, ...formData }).unwrap();
      } else {
        await createProduct({ tenant_id: selectedTenantId, ...formData }).unwrap();
      }
      navigate('/products');
    } catch (err) {
      setError(err.data?.error || 'Something went wrong');
    }
  };

  const isLoading = isCreating || isUpdating;

  if (!selectedTenantId) {
    return (
      <div className="max-w-lg mx-auto p-12 glass-card border border-[#E2E8F0] rounded-2xl text-center space-y-4">
        <p className="text-[#1E293B] font-bold">Select a tenant to add or edit products.</p>
        <TenantDropdown />
      </div>
    );
  }

  if (isEdit && isFetchingDetails) return (
    <div className="flex items-center justify-center p-12">
      <Package className="w-8 h-8 text-violet-600 animate-pulse" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/products')}
        className="group flex items-center gap-2 text-[#64748B] hover:text-violet-600 transition-colors font-semibold"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Catalog
      </button>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-violet-100 border border-violet-200 rounded-2xl flex items-center justify-center text-violet-600 shadow-sm">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#1E293B] tracking-tight">
            {isEdit ? 'Edit Product' : 'Register New Product'}
          </h1>
          <p className="text-[#64748B] mt-1 font-medium">
            {isEdit ? 'Update product specifications and thresholds.' : 'Add a new item to your multi-tenant catalog.'}
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
          <Package size={200} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-violet-600 mb-4">Basic Information</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" /> Product Name <span className="text-violet-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-[#9CA3AF] font-medium"
                  placeholder="MacBook Pro M3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5" /> SKU (Unique ID) <span className="text-violet-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#1E293B] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-[#9CA3AF]"
                  placeholder="LAP-MBP-001"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                  <LayoutGrid className="w-3.5 h-3.5" /> Category <span className="text-violet-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-[#9CA3AF] font-medium"
                  placeholder="Electronics"
                />
              </div>
            </div>

            <div className="space-y-6 text-indigo-400">
              <h3 className="text-sm font-black uppercase tracking-widest text-violet-600 mb-4">Inventory & Cost</h3>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" /> Reorder Threshold <span className="text-violet-600">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.reorder_threshold}
                  onChange={(e) => setFormData({ ...formData, reorder_threshold: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-bold"
                />
                <p className="text-[10px] text-[#64748B] font-medium tracking-tight">Alert triggers when stock falls below this value.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" /> Cost Per Unit <span className="text-violet-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] text-sm font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl pl-8 pr-4 py-3 text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1E293B]">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer font-bold"
                >
                  <option value="Active" className="bg-white text-[#1E293B]">Active</option>
                  <option value="Inactive" className="bg-white text-[#1E293B]">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex items-center gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 btn-premium text-white px-6 py-4 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-5 h-5 text-white" />
              {isLoading ? 'Processing...' : (isEdit ? 'Save Changes' : 'Register Product')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-8 py-4 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] rounded-2xl font-bold transition-all"
            >
              Discard
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
