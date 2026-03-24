import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetOrderQuery, useUpdateOrderMutation } from '../../api/orderApi';
import { useGetInventoryQuery } from '../../api/inventoryApi';
import { useGetActiveProductsQuery } from '../../api/productApi';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ShoppingCart,
  Package,
  AlertCircle,
  Save,
  Layers,
} from 'lucide-react';
import TenantDropdown from '../../components/shared/TenantDropdown';

export default function OrderEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const selectedTenantId = useSelector((s) => s.tenant.selectedTenantId);

  const { data: orderRes, isLoading: orderLoading, isError: orderError } = useGetOrderQuery(
    { id, tenant_id: selectedTenantId },
    { skip: !id || !selectedTenantId }
  );
  const order = orderRes?.data;

  const { data: products = [] } = useGetActiveProductsQuery(
    { tenant_id: selectedTenantId },
    { skip: !selectedTenantId }
  );

  const { data: invRes } = useGetInventoryQuery(
    { tenant_id: selectedTenantId, limit: 500 },
    { skip: !selectedTenantId }
  );
  const inventoryRows = invRes?.data?.rows || [];

  const [updateOrder, { isLoading: saving }] = useUpdateOrderMutation();

  const [formData, setFormData] = useState({ product_id: '', quantity: 1 });
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      setFormData({ product_id: order.product_id, quantity: order.quantity });
    }
  }, [order]);

  const selectedProduct = products.find((p) => String(p.id) === String(formData.product_id));
  const currentStock =
    inventoryRows.find((i) => String(i.product_id) === String(formData.product_id))?.quantity ?? 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedTenantId || !formData.product_id) return;
    try {
      await updateOrder({
        id,
        tenant_id: selectedTenantId,
        product_id: formData.product_id,
        quantity: formData.quantity,
      }).unwrap();
      navigate(`/orders/${id}`);
    } catch (err) {
      setError(err?.data?.error || err?.data?.message || 'Update failed');
    }
  };

  if (!selectedTenantId) {
    return (
      <div className="max-w-lg mx-auto p-12 glass-card border border-[#E2E8F0] rounded-2xl text-center space-y-4">
        <p className="text-[#1E293B] font-bold">Select a tenant to edit this order.</p>
        <TenantDropdown />
      </div>
    );
  }

  if (orderLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-violet-600 animate-pulse">
        <ShoppingCart className="w-12 h-12" />
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="max-w-lg mx-auto p-12 text-center glass-card border border-[#E2E8F0] rounded-2xl">
        <p className="text-[#1E293B] font-bold mb-4">Order not found for this tenant.</p>
        <button type="button" onClick={() => navigate('/orders')} className="text-violet-600 font-bold">
          Back to orders
        </button>
      </div>
    );
  }

  if (order.status === 'Confirmed' || order.status === 'Cancelled') {
    return (
      <div className="max-w-lg mx-auto p-12 glass-card border border-[#E2E8F0] rounded-2xl text-center space-y-4">
        <p className="text-[#1E293B] font-bold">This order can no longer be edited.</p>
        <button
          type="button"
          onClick={() => navigate(`/orders/${id}`)}
          className="text-violet-600 font-bold"
        >
          View order
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        type="button"
        onClick={() => navigate(`/orders/${id}`)}
        className="group flex items-center gap-2 text-[#64748B] hover:text-violet-600 transition-colors font-semibold"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to order
      </button>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-violet-100 border border-violet-200 rounded-2xl flex items-center justify-center text-violet-600 shadow-sm">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#1E293B] tracking-tight">Edit order</h1>
          <p className="text-[#64748B] mt-1 font-medium text-sm font-mono">{order.id}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border border-[#E2E8F0]"
      >
        <form onSubmit={handleSubmit} className="space-y-8 max-w-xl">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
              <Package className="w-4 h-4 text-violet-600" /> Select product{' '}
              <span className="text-violet-600">*</span>
            </label>
            <select
              required
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              style={{ colorScheme: 'light' }}
              className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-6 py-4 text-base font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 appearance-none cursor-pointer"
            >
              <option value="" className="text-slate-500 bg-white">
                Choose a product…
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-white text-slate-900">
                  {p.name} — {p.sku}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#64748B]">Only active products are listed.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-600" /> Requested quantity{' '}
              <span className="text-violet-600">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) })}
              className="w-full bg-slate-50 border border-[#E2E8F0] rounded-2xl px-6 py-4 text-[#1E293B] font-black text-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {selectedProduct ? (
            <p className="text-sm text-[#64748B]">
              Current stock for this SKU: <span className="font-black text-[#1E293B]">{currentStock}</span>
              {currentStock >= formData.quantity ? (
                <span className="text-emerald-600 font-bold ml-2">→ Created</span>
              ) : (
                <span className="text-amber-600 font-bold ml-2">→ Pending</span>
              )}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={saving || !formData.product_id}
            className="flex items-center justify-center gap-2 btn-premium text-white px-8 py-4 rounded-2xl font-black disabled:opacity-50"
          >
            <Save className="w-5 h-5 text-white" />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
