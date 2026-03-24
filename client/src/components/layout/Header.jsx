import { useState, useRef, useEffect } from 'react';
import { Bell, User, LayoutDashboard } from 'lucide-react';
import { useGetInventoryQuery } from '../../api/inventoryApi';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const navigate = useNavigate();
  const selectedTenantId = useSelector((state) => state.tenant.selectedTenantId);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const { data: inventoryData } = useGetInventoryQuery(
    { tenant_id: selectedTenantId, limit: 100 },
    { skip: !selectedTenantId }
  );
  const lowStockItems =
    inventoryData?.data?.rows?.filter((item) => item.quantity <= item.reorder_threshold) || [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] flex items-center justify-between px-8 flex-shrink-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 btn-premium rounded-xl flex items-center justify-center">
          <LayoutDashboard className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-[#1E293B] tracking-tight">
          Aura<span className="text-violet-600">Inventory</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {selectedTenantId ? (
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2.5 rounded-xl transition-all ${
                showNotifications
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                  : 'text-[#64748B] hover:text-violet-600 hover:bg-violet-50'
              }`}
              aria-label="Inventory alerts"
            >
              <Bell className="w-5 h-5" />
              {lowStockItems.length > 0 && (
                <span
                  className={`absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 ${
                    showNotifications ? 'border-violet-600' : 'border-white'
                  }`}
                />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-[#F1F5F9] flex justify-between items-center bg-[#F8FAFC]">
                    <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-widest">
                      Inventory alerts
                    </h3>
                    {lowStockItems.length > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {lowStockItems.length}
                      </span>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {lowStockItems.length === 0 ? (
                      <p className="p-6 text-center text-sm text-[#64748B]">All stock levels are healthy.</p>
                    ) : (
                      lowStockItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            navigate(`/inventory/${item.id}`);
                            setShowNotifications(false);
                          }}
                          className="w-full p-4 border-b border-[#F1F5F9] last:border-0 hover:bg-rose-50 transition-colors text-left text-sm font-bold text-[#1E293B]"
                        >
                          {item.product_name} — {item.quantity} left
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : null}

        <div
          className="flex items-center gap-3 pl-4 border-l border-[#E2E8F0] cursor-pointer group"
          onClick={() => navigate('/tenants')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/tenants')}
          role="button"
          tabIndex={0}
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-[#1E293B] group-hover:text-violet-600 transition-colors">
              Admin
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl btn-premium flex items-center justify-center shadow-lg shadow-violet-500/20">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
