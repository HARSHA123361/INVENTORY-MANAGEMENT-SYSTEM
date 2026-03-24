import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Package, BarChart3, ShoppingCart, ChevronRight } from 'lucide-react';

const navItems = [
  { to: '/tenants', label: 'Tenant', icon: Building2 },
  { to: '/products', label: 'Product', icon: Package },
  { to: '/inventory', label: 'Inventory', icon: BarChart3 },
  { to: '/orders', label: 'Order', icon: ShoppingCart },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col h-full z-20 shadow-sm">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-violet-50 text-violet-600 shadow-sm border border-violet-100'
                    : 'text-[#64748B] hover:text-violet-600 hover:bg-violet-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-violet-600' : 'group-hover:text-violet-600'}`} />
                  <span>{label}</span>
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-violet-600 rounded-r-full shadow-sm"
                  />
                )}
                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-[#F4F0FF] p-4 rounded-2xl border border-[#7C3AED]/10">
          <p className="text-xs text-[#7C3AED] font-bold mb-2">Pro Plan Active</p>
          <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
            <div className="h-full w-3/4 btn-premium" />
          </div>
          <p className="text-[10px] text-[#64748B] mt-2 font-medium tracking-wide">75% USAGE REACHED</p>
        </div>
      </div>
    </aside>
  );
}
