import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetInventoryItemQuery, useUpdateInventoryMutation } from '../../api/inventoryApi';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Package,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Clock,
  Save,
  Link as LinkIcon,
} from 'lucide-react';
import TenantDropdown from '../../components/shared/TenantDropdown';

export default function InventoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const selectedTenantId = useSelector((state) => state.tenant.selectedTenantId);
  const { data: itemData, isLoading } = useGetInventoryItemQuery(
    { id, tenant_id: selectedTenantId },
    { skip: !id || !selectedTenantId }
  );
  const [updateInventory, { isLoading: isUpdating }] = useUpdateInventoryMutation();

  const item = itemData?.data;
  const [newQuantity, setNewQuantity] = useState(0);

  useEffect(() => {
    if (item) {
      setNewQuantity(item.quantity);
    }
  }, [item]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateInventory({ id, tenant_id: selectedTenantId, quantity: newQuantity }).unwrap();
    } catch (err) {
      alert(err.data?.message || 'Failed to update stock');
    }
  };

  if (!selectedTenantId) {
    return (
      <div className="max-w-lg mx-auto p-12 glass-card border border-[#E2E8F0] rounded-2xl text-center space-y-4">
        <p className="text-[#1E293B] font-bold">Select a tenant to view this inventory record.</p>
        <TenantDropdown />
      </div>
    );
  }

  if (isLoading) return (
    <div className="flex items-center justify-center p-20 animate-pulse text-violet-600">
      <RefreshCw className="w-12 h-12 animate-spin" />
    </div>
  );

  if (!item) return (
    <div className="p-12 text-center glass-card border border-[#E2E8F0] rounded-2xl max-w-lg mx-auto">
      <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-[#1E293B]">Record Disconnected</h2>
      <p className="text-[#64748B] mt-2 font-medium">This inventory item no longer exists or tracing failed.</p>
      <button onClick={() => navigate('/inventory')} className="mt-6 bg-[#F1F5F9] hover:bg-[#E2E8F0] px-6 py-2 rounded-xl text-violet-600 font-bold transition-all border border-[#E2E8F0]">Back to List</button>
    </div>
  );

  const isLowStock = item.quantity <= item.reorder_threshold;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/inventory')}
        className="group flex items-center gap-2 text-[#64748B] hover:text-violet-600 transition-colors font-semibold"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Stock Overview
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-3xl border border-[#E2E8F0] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Package size={180} />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-8">
              <div className="w-16 h-16 btn-premium rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-violet-200">
                {item.product_name.charAt(0)}
              </div>
              <div>
                <h1 
                  className="text-2xl font-black text-[#1E293B] hover:text-violet-600 cursor-pointer flex items-center gap-2 transition-colors"
                  onClick={() => navigate(`/products/${item.product_id}`)}
                >
                  {item.product_name}
                  <LinkIcon className="w-4 h-4" />
                </h1>
                <p className="text-[#64748B] font-mono text-xs font-bold tracking-wider mt-1 uppercase">{item.sku}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] shadow-sm">
                <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-widest mb-1">Current Stock</p>
                <p className={`text-2xl font-black ${isLowStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {item.quantity} <span className="text-xs font-normal text-[#64748B]">Available</span>
                </p>
              </div>
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] shadow-sm">
                <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-widest mb-1">Reorder Point</p>
                <p className="text-2xl font-black text-[#1E293B]">
                  {item.reorder_threshold} <span className="text-xs font-normal text-[#64748B]">Threshold</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Update Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 rounded-3xl border border-[#E2E8F0]"
          >
            <h3 className="text-lg font-black text-[#1E293B] mb-6 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-violet-600" />
              Direct Stock Adjustment
            </h3>
            <form onSubmit={handleUpdate} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-[#1E293B] mb-2">
                  Current INVENTORY <span className="text-violet-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-2xl px-6 py-4 text-[#1E293B] font-black text-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center justify-center gap-2 btn-premium text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 min-w-[200px]"
              >
                <Save className="w-5 h-5 text-white" />
                {isUpdating ? 'Synchronizing...' : 'Update Levels'}
              </button>
            </form>
            <div className="mt-4 flex items-start gap-2 text-[10px] text-[#64748B] bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] font-medium">
              <Clock className="w-3.5 h-3.5 mt-0.5 text-violet-600" />
              Adjusting stock manually creates an audit trail entry. This change is immediate across all platforms.
            </div>
          </motion.div>
        </div>

        {/* Right Side: Insights */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl bg-violet-50 border border-violet-100 shadow-sm">
            <h4 className="text-sm font-black text-[#1E293B] mb-4 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-600" />
              Insights
            </h4>
            <div className="space-y-4">
              {isLowStock ? (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 shadow-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 leading-relaxed font-bold">Critical Stock Alert! Inventory level is below replenishment threshold. Consider placing a new order immediately.</p>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 shadow-sm">
                  <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-700 leading-relaxed font-bold">Inventory Healthy. Current stock is 65% above the reorder point.</p>
                </div>
              )}
              
              <div className="p-4 bg-white shadow-sm rounded-2xl border border-[#E2E8F0] space-y-2">
                <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest">Projected Out-of-Stock</p>
                <p className="text-[#1E293B] text-sm font-black">~ 14 Days</p>
                <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden shadow-inner">
                  <div className="h-full w-2/3 bg-violet-600 shadow-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-[#E2E8F0] shadow-sm bg-white">
            <h4 className="text-sm font-black text-[#1E293B] mb-2 tracking-tight uppercase tracking-widest">Need Assistance?</h4>
            <p className="text-xs text-[#64748B] mb-4 font-medium">Request a restock or contact your procurement manager for this SKU.</p>
            <button className="w-full bg-[#F8FAFC] hover:bg-violet-50 text-violet-600 py-3 rounded-xl text-xs font-black transition-all border border-[#E2E8F0] uppercase tracking-wider">
              Generate Restock Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
