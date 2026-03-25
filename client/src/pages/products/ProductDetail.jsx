import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetProductQuery, useDeleteProductMutation } from '../../api/productApi';
import StatusBadge from '../../components/shared/StatusBadge';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Edit,
  Trash2,
  Package,
  Tag,
  LayoutGrid,
  DollarSign,
  AlertTriangle,
  History,
  TrendingUp,
  Box,
} from 'lucide-react';
import TenantDropdown from '../../components/shared/TenantDropdown';
import { formatDate } from '../../utils/date';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const selectedTenantId = useSelector((s) => s.tenant.selectedTenantId);
  const { data: productData, isLoading } = useGetProductQuery(
    { id, tenant_id: selectedTenantId },
    { skip: !id || !selectedTenantId }
  );
  const [deleteProduct] = useDeleteProductMutation();

  const product = productData?.data;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct({ id, tenant_id: selectedTenantId });
      navigate('/products');
    }
  };

  if (!selectedTenantId) {
    return (
      <div className="max-w-lg mx-auto p-12 glass-card border border-[#E2E8F0] rounded-2xl text-center space-y-4">
        <p className="text-[#1E293B] font-bold">Select a tenant to view this product.</p>
        <TenantDropdown />
      </div>
    );
  }

  if (isLoading) return (
    <div className="flex items-center justify-center p-20 animate-pulse">
      <Package className="w-12 h-12 text-violet-600" />
    </div>
  );

  if (!product) return (
    <div className="p-8 text-center glass-card border border-[#E2E8F0] rounded-2xl max-w-lg mx-auto">
      <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-[#1E293B]">Product Not Found</h2>
      <button onClick={() => navigate('/products')} className="mt-4 text-violet-600 font-bold hover:underline">Return to Catalog</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/products')}
          className="group flex items-center gap-2 text-[#64748B] hover:text-violet-600 transition-colors font-semibold"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to List
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/products/${id}/edit`)}
            className="flex items-center gap-2 bg-violet-50 hover:bg-violet-100 text-violet-600 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-violet-100 shadow-sm"
          >
            <Edit className="w-4 h-4 text-violet-600" />
            Edit Profile
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-rose-500/20"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Product Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="glass-card p-8 rounded-3xl border border-[#E2E8F0] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <Package size={240} />
            </div>
            
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 btn-premium rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-violet-200">
                  {product.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-black text-[#1E293B] tracking-tight">{product.name}</h1>
                    <StatusBadge status={product.status} />
                  </div>
                  <p className="text-violet-600 font-mono text-xs font-bold tracking-widest uppercase">{product.sku}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 relative z-10">
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Category</p>
                <div className="flex items-center gap-2 text-[#1E293B] font-bold">
                  <LayoutGrid className="w-4 h-4 text-violet-600" />
                  {product.category}
                </div>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-[#64748B] mb-1">Cost / Unit</p>
                <div className="flex items-center gap-2 text-[#1E293B] font-black">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  ${product.cost_per_unit.toFixed(2)}
                </div>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-[#64748B] mb-1">Stock Threshold</p>
                <div className="flex items-center gap-2 text-[#1E293B] font-black">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  {product.reorder_threshold} units
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-[#1E293B] flex items-center gap-2">
                <History className="w-5 h-5 text-violet-600" />
                Performance Metrics
              </h3>
              <span className="text-xs text-[#64748B] font-medium">Last 30 days</span>
            </div>
            <div className="h-48 flex items-end gap-2 px-4 bg-slate-50 rounded-2xl border border-[#E2E8F0] p-4">
              {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                  <div 
                    className="w-full bg-violet-200 group-hover:bg-violet-600 rounded-t-lg transition-all cursor-pointer shadow-sm" 
                    style={{ height: `${h}%` }} 
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-4 text-[10px] font-black text-[#64748B] uppercase tracking-widest">
              <span>week 1</span>
              <span>week 2</span>
              <span>week 3</span>
              <span>week 4</span>
            </div>
          </div>
        </motion.div>

        {/* Sidebar Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="glass-card p-6 rounded-3xl bg-violet-50 border border-violet-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
                <Box className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black text-[#1E293B]">Quick Stats</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B] text-sm font-medium">Created At</span>
                <span className="text-[#1E293B] text-sm font-black">{formatDate(product.created_at)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B] text-sm font-medium">Last Restock</span>
                <span className="text-[#1E293B] text-sm font-black">2 days ago</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#64748B] text-sm font-medium">Supplier</span>
                <span className="text-[#1E293B] text-sm font-black">Global Tech</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-[#E2E8F0] shadow-sm text-center">
            <p className="text-[#64748B] text-sm mb-4 font-medium">Integrate with sales data to see real-time demand forecasting.</p>
            <button className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] py-3 rounded-xl text-sm font-bold transition-all border border-[#E2E8F0]">
              Upgrade to Advanced Analytics
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
