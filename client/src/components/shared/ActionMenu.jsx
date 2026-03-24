import { useState, useRef, useEffect } from 'react';

/**
 * ActionMenu — the three-dots (⋮) dropdown used in every list table row.
 * props.actions: [{ label, onClick, danger? }]
 */
export default function ActionMenu({ actions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 text-gray-400 hover:text-gray-700 rounded"
        title="Actions"
      >
        ⋮
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {actions.map(({ label, onClick, danger }) => (
            <button
              key={label}
              onClick={() => { onClick(); setOpen(false); }}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                danger ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
