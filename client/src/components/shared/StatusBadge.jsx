const STATUS_STYLES = {
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  Created: 'bg-violet-100 text-violet-700 border-violet-200',
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-slate-50 text-[#64748B] border-slate-200';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style}`}>
      {status}
    </span>
  );
}
