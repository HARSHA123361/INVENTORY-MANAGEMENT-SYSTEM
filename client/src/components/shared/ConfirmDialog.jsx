import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-card border border-[#E2E8F0] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1E293B] tracking-tight">{title}</h3>
              </div>
              
              <p className="text-[#64748B] leading-relaxed mb-8 font-medium">
                {message}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onConfirm}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-rose-500/25 active:scale-95"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] py-3 rounded-2xl font-bold transition-all border border-[#E2E8F0]"
                >
                  Dismiss
                </button>
              </div>
            </div>
            
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-2 text-[#64748B] hover:text-[#1E293B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
