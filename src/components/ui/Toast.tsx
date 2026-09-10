import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

const typeConfig = {
  success: { icon: CheckCircle2, className: "bg-teal-600 text-white" },
  error: { icon: AlertCircle, className: "bg-red-600 text-white" },
  info: { icon: Info, className: "bg-gray-900 text-white" },
} as const;

export function ToastContainer() {
  const { toasts } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = typeConfig[toast.type] ?? typeConfig.info;
          const Icon = config.icon;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40, transition: { duration: 0.15 } }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${config.className}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{toast.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}