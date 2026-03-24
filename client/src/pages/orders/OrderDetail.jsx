import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetOrderQuery, useUpdateOrderMutation } from '../../api/orderApi';
import TenantDropdown from '../../components/shared/TenantDropdown';
import StatusBadge from '../../components/shared/StatusBadge';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Check, 
  X, 
  ShoppingCart, 
  Package, 
  Inbox, 
  Calendar, 
  AlertCircle,
  Link as LinkIcon,
  ShieldCheck,
  TrendingUp,
  History
} from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const selectedTenantId = useSelector((s) => s.tenant.selectedTenantId);
  const { data: orderData, isLoading } = useGetOrderQuery(
    { id, tenant_id: selectedTenantId },
    { skip: !id || !selectedTenantId }
  );
  const [updateOrder, { isLoading: updating }] = useUpdateOrderMutation();

  const order = orderData?.data;
  const available = order?.effective_available ?? order?.inventory_quantity ?? 0;

  const handleConfirm = async () => {
    try {
      await updateOrder({ id, tenant_id: selectedTenantId, status: 'Confirmed' }).unwrap();
    } catch (err) {
      alert(err?.data?.error || err?.data?.message || 'Confirmation failed');
    }
  };

  const handleCancel = async () => {
    try {
      await updateOrder({ id, tenant_id: selectedTenantId, status: 'Cancelled' }).unwrap();
    } catch (err) {
      alert(err?.data?.error || err?.data?.message || 'Cancellation failed');
    }
  };

  if (!selectedTenantId) {
    return (
      <div className="max-w-lg mx-auto p-12 glass-card border border-[#E2E8F0] rounded-2xl text-center space-y-4">
        <p className="text-[#1E293B] font-bold">Select a tenant to view this order.</p>
        <TenantDropdown />
      </div>
    );
  }

  if (isLoading) return (
    <div className="flex items-center justify-center p-20 text-violet-600 animate-pulse">
      <ShoppingCart className="w-12 h-12" />
    </div>
  );

  if (!order) return (
    <div className="p-12 text-center glass-card border border-[#E2E8F0] rounded-2xl max-w-lg mx-auto">
      <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-[#1E293B]">Order Record Missing</h2>
      <button onClick={() => navigate('/orders')} className="mt-6 text-violet-600 font-bold">Return to Ledger</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/orders')}
          className="group flex items-center gap-2 text-[#64748B] hover:text-violet-600 transition-colors font-semibold"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Ledger
        </button>
        
        {order.status === 'Created' || order.status === 'Pending' ? (
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={updating}
                className="flex items-center gap-2 btn-premium text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
              >
                <Check className="w-4 h-4 text-white" />
                Confirm
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={updating}
                className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-rose-100 active:scale-95 disabled:opacity-50 shadow-sm"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
            <p className="text-[10px] text-[#64748B] max-w-xs text-right font-medium">
              Confirm reserves stock: available quantity is reduced by the order amount. You need enough
              on-hand units or confirmation will be blocked.
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Context Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-3xl border border-[#E2E8F0] shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <ShoppingCart size={200} />
            </div>

            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 btn-premium rounded-2xl flex items-center justify-center text-white">
                  <Inbox size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-violet-600 tracking-widest mb-0.5">Order Identity</p>
                  <h1 className="text-2xl font-black text-[#1E293B] tracking-tight uppercase font-mono">#{order.id.slice(0, 12)}</h1>
                </div>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10 relative z-10">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Target Product</label>
                  <div 
                    className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] hover:border-violet-300 cursor-pointer transition-all group"
                    onClick={() => navigate(`/products/${order.product_id}`)}
                  >
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1E293B] group-hover:text-violet-600 flex items-center gap-1 transition-colors">
                        {order.product_name}
                        <LinkIcon className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                      </p>
                      <p className="text-[10px] text-[#64748B] font-medium tracking-tighter uppercase">{order.sku}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 shadow-sm">
                  <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-widest block mb-1 text-center">Requested Quantity</label>
                  <p className="text-4xl font-black text-[#1E293B] text-center">{order.quantity}</p>
                  <p className="text-[10px] text-center text-violet-600 mt-1 font-black">UNITS PENDING</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-[#F1F5F9] flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-violet-600" />
                <span className="text-xs text-[#64748B] font-semibold">Recorded on {new Date(order.created_at).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase">Verification Passed</span>
              </div>
            </div>
          </motion.div>

          {/* Fulfillment Status */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 rounded-3xl border border-[#E2E8F0] shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-[#1E293B] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                Fulfillment Logic
              </h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-1 h-12 rounded-full ${
                    order.quantity <= available
                      ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                      : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                  }`}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-black text-[#1E293B]">Inventory match</p>
                    <p className="text-xs text-[#64748B] font-medium">{available} units available</p>
                  </div>
                  <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        order.quantity <= available ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${Math.min((available / (order.quantity || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                <p className="text-xs text-[#64748B] leading-relaxed font-medium">
                  {order.quantity <= available
                    ? 'Sufficient stock at order time. You can confirm or cancel from here.'
                    : 'Insufficient stock at order time — order was saved as Pending until inventory is replenished.'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl bg-violet-50 border border-violet-100 shadow-sm">
            <h4 className="text-sm font-black text-[#1E293B] mb-6 tracking-widest uppercase flex items-center gap-2">
              <History className="w-4 h-4 text-violet-600" />
              Audit Log
            </h4>
            <div className="space-y-6 relative">
              <div className="absolute left-3.5 top-2 bottom-2 w-[1px] bg-[#E2E8F0]" />
              
              <div className="relative pl-8">
                <div className="absolute left-2.5 top-1 w-2 h-2 rounded-full bg-violet-600 shadow-sm" />
                <p className="text-xs font-black text-[#1E293B]">Order Initialized</p>
                <p className="text-[10px] text-[#64748B] mt-1 font-medium">{new Date(order.created_at).toLocaleTimeString()}</p>
              </div>
              
              {order.status !== 'Created' && order.status !== 'Pending' && (
                <div className="relative pl-8">
                  <div className="absolute left-2.5 top-1 w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-xs font-black text-[#1E293B]">Status Transitioned to {order.status}</p>
                  <p className="text-[10px] text-[#64748B] mt-1 font-medium">System automated</p>
                </div>
              )}

              <div className="relative pl-8 opacity-40">
                <div className="absolute left-2.5 top-1 w-2 h-2 rounded-full border border-[#E2E8F0]" />
                <p className="text-xs font-bold text-[#64748B]">Final Fulfillment</p>
                <p className="text-[10px] text-[#64748B] mt-1 font-medium">Pending action</p>
              </div>
            </div>
          </div>

          <button className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0] py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-[#475569] hover:text-violet-600 transition-all border border-[#E2E8F0]">
            Export Invoice.pdf
          </button>
        </div>
      </div>
    </div>
  );
}
