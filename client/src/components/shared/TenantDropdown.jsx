import { useSelector, useDispatch } from 'react-redux';
import { useGetTenantsQuery } from '../../api/tenantApi';
import { setSelectedTenant } from '../../store/tenantSlice';
import { ChevronDown, Building2 } from 'lucide-react';

export default function TenantDropdown() {
  const dispatch = useDispatch();
  const { selectedTenantId } = useSelector((s) => s.tenant);
  const { data, isLoading } = useGetTenantsQuery({ limit: 100 });
  const tenants = data?.data?.rows || [];

  const handleChange = (e) => {
    const tenant = tenants.find((t) => String(t.id) === String(e.target.value));
    if (tenant) dispatch(setSelectedTenant({ id: tenant.id, name: tenant.name }));
    else dispatch(setSelectedTenant({ id: null, name: null }));
  };

  return (
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-600 transition-opacity">
        <Building2 size={14} />
      </div>
      <select
        id="tenant-dropdown"
        value={selectedTenantId || ''}
        onChange={handleChange}
        className="pl-9 pr-10 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-black text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer hover:bg-[#F8FAFC] min-w-[200px]"
        disabled={isLoading}
      >
        <option value="" className="bg-white">Select Organization...</option>
        {tenants.map((t) => (
          <option key={t.id} value={t.id} className="bg-white text-[#1E293B]">
            {t.name}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]">
        <ChevronDown size={14} />
      </div>
    </div>
  );
}
