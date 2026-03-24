import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, total, limit, onPageChange }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 pt-6">
      <div className="hidden sm:block">
        <p className="text-xs font-black text-[#64748B] uppercase tracking-widest">
          Showing <span className="text-[#1E293B] font-black">{(page - 1) * limit + 1}</span> to <span className="text-[#1E293B] font-black">{Math.min(page * limit, total)}</span> of <span className="text-[#1E293B] font-black">{total}</span> assets
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 bg-white border border-[#E2E8F0] shadow-sm rounded-xl text-[#64748B] hover:text-violet-600 hover:bg-violet-50 transition-all disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                p === page 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25 ring-2 ring-violet-500/10' 
                  : 'text-[#64748B] hover:text-violet-600 hover:bg-violet-50 border border-transparent'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 bg-white border border-[#E2E8F0] shadow-sm rounded-xl text-[#64748B] hover:text-violet-600 hover:bg-violet-50 transition-all disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
