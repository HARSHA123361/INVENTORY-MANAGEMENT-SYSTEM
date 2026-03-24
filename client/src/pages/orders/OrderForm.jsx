import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetActiveProductsQuery } from '../../api/productApi';
import { useGetInventoryQuery } from '../../api/inventoryApi';
import { useCreateOrderMutation, useGetOrdersQuery } from '../../api/orderApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ShoppingCart,
  Package,
  AlertCircle,
  Send,
  Box,
  Info,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import TenantDropdown from '../../components/shared/TenantDropdown';

export default function OrderForm() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const selectedTenantId = useSelector((state) => state.tenant.selectedTenantId);

  const queryParams = new URLSearchParams(search);
  const initialProductId = queryParams.get('product_id') || '';

  const [formData, setFormData] = useState({ 
    product_id: initialProductId, 
    quantity: 1 
  });
  const [error, setError] = useState('');

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
    error: productsErr,
    refetch: refetchProducts,
  } = useGetActiveProductsQuery(
    { tenant_id: selectedTenantId },
    { skip: !selectedTenantId }
  );

  const { data: inventoryData } = useGetInventoryQuery(
    { tenant_id: selectedTenantId, limit: 500 },
    { skip: !selectedTenantId, refetchOnMountOrArgChange: true }
  );

  const { data: ordersData } = useGetOrdersQuery(
    { tenant_id: selectedTenantId, limit: 500 },
    { skip: !selectedTenantId, refetchOnMountOrArgChange: true }
  );

  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

  const inventory = inventoryData?.data?.rows || [];
  const allOrders = ordersData?.data?.rows || [];

  const selectedProduct = products.find(p => String(p.id) === String(formData.product_id));

  const rawStock = inventory.find(i => String(i.product_id) === String(formData.product_id))?.quantity || 0;
  const committed = allOrders
    .filter(o => String(o.product_id) === String(formData.product_id) && o.status === 'Created')
    .reduce((sum, o) => sum + o.quantity, 0);
  const currentStock = Math.max(0, rawStock - committed);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTenantId || !formData.product_id) return;
    setError('');

    try {
      await createOrder({ tenant_id: selectedTenantId, ...formData }).unwrap();
      navigate('/orders');
    } catch (err) {
      const msg = err?.data?.error || err?.data?.message || err?.error || 'Transaction failed. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Transaction failed. Please try again.');
    }
  };

  if (!selectedTenantId) {
    return (
      <div className="max-w-lg mx-auto p-12 glass-card border border-[#E2E8F0] rounded-2xl text-center space-y-4">
        <p className="text-[#1E293B] font-bold">Select a tenant before creating an order.</p>
        <TenantDropdown />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/orders')}
        className="group flex items-center gap-2 text-[#64748B] hover:text-violet-600 transition-colors font-semibold"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Order Ledger
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-100 border border-violet-200 rounded-2xl flex items-center justify-center text-violet-600 shadow-sm">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1E293B] tracking-tight">Create order</h1>
            <p className="text-[#64748B] mt-1 font-medium">Only active products for the selected tenant appear below.</p>
          </div>
        </div>
        <TenantDropdown />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 border border-[#E2E8F0]"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {productsError && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-sm text-amber-900 space-y-2">
                <p className="font-bold">Could not load active products.</p>
                <p className="text-amber-800 text-xs">
                  {productsErr?.data?.error || productsErr?.error || 'Check that the API is running and try again.'}
                </p>
                <button
                  type="button"
                  onClick={() => refetchProducts()}
                  className="text-xs font-black text-violet-600 uppercase tracking-wide"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1E293B] flex items-center gap-2" htmlFor="order-product-select">
                <Package className="w-4 h-4 text-violet-600" /> Select product <span className="text-violet-600">*</span>
              </label>
              <div className="relative">
                <select
                  id="order-product-select"
                  required
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  disabled={productsLoading || productsError}
                  style={{ colorScheme: 'light' }}
                  className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-6 py-4 text-base font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60 appearance-none cursor-pointer"
                >
                  <option value="" className="text-slate-500 bg-white">
                    {productsLoading ? 'Loading products…' : 'Choose a product…'}
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white text-slate-900">
                      {p.name} — {p.sku}
                    </option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronLeft className="w-4 h-4 rotate-[270deg]" />
                </div>
              </div>
              {!productsLoading && !productsError && products.length === 0 && (
                <p className="text-xs text-amber-700 font-medium">
                  No active products for this tenant. Add an active product in the product catalog first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-600" /> Requested Quantity <span className="text-violet-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-2xl px-6 py-4 text-[#1E293B] font-black text-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Units</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreating || !formData.product_id}
              className="w-full flex items-center justify-center gap-3 btn-premium text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Send className="w-5 h-5 text-white" />
              {isCreating ? 'Transacting...' : 'Commit Order'}
            </button>
          </form>
        </motion.div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {selectedProduct ? (
              <motion.div
                key={selectedProduct.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 space-y-6"
              >
                <div className="flex items-center gap-4 pb-4 border-b border-[#F1F5F9]">
                  <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-200">
                    {selectedProduct.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#1E293B]">{selectedProduct.name}</h3>
                    <p className="text-xs text-violet-600 font-mono font-bold tracking-widest">{selectedProduct.sku}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/50 rounded-2xl border border-[#E2E8F0] shadow-sm">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Processing units (in stock)</p>
                    <p className={`text-xl font-black ${currentStock >= formData.quantity ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {currentStock}{' '}
                      <span className="text-[10px] font-normal text-[#64748B] lowercase">available</span>
                    </p>
                  </div>
                  <div className="p-4 bg-white/50 rounded-2xl border border-[#E2E8F0] shadow-sm text-right">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Order status (on submit)</p>
                    <p className={`text-sm font-black ${currentStock >= formData.quantity ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {currentStock >= formData.quantity ? 'Created' : 'Pending'}
                    </p>
                  </div>
                </div>

                {currentStock < formData.quantity ? (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 shadow-sm">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-800 leading-relaxed font-black uppercase tracking-wider">
                      Stock deficit detected. This order will be queued as "Pending" until replenishment occurs.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-emerald-800 leading-relaxed font-black uppercase tracking-wider">
                      Inventory verified. Sufficient stock available for immediate fulfillment.
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="glass-card p-12 rounded-3xl border border-[#E2E8F0] shadow-sm text-center flex flex-col items-center justify-center space-y-4 h-full min-h-[300px]">
                <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600">
                  <Box size={32} />
                </div>
                <div>
                  <h4 className="text-[#1E293B] font-black">Awaiting Selection</h4>
                  <p className="text-xs text-[#64748B] mt-1 max-w-[200px] mx-auto font-medium">Select a product to view real-time availability and projected status.</p>
                </div>
              </div>
            )}
          </AnimatePresence>

          <div className="p-6 bg-violet-50 border border-violet-100 rounded-3xl flex items-start gap-4">
            <div className="p-2 bg-violet-600 rounded-lg text-white shadow-sm">
              <Info size={18} />
            </div>
            <div>
              <p className="text-[10px] text-violet-600 font-black uppercase tracking-[0.15em] mb-1">Compliance Check</p>
              <p className="text-xs text-[#64748B] leading-relaxed font-medium">Orders are automatically routed based on tenant-specific isolation rules. Final quantity checks happen at commit time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
