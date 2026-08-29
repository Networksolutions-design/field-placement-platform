import { useApp } from "@/context/AppContext";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed bottom-20 right-4 left-4 sm:left-auto sm:bottom-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-md bg-white border border-gray-100 animate-[slideIn_0.2s_ease-out] ${
            t.type === "success"
              ? "border-l-4 border-l-teal-600"
              : t.type === "error"
                ? "border-l-4 border-l-red-500"
                : "border-l-4 border-l-gray-400"
          }`}
        >
          {t.type === "success" && (
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          )}
          {t.type === "error" && (
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          )}
          {t.type === "info" && (
            <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-gray-800 flex-1">{t.message}</p>
          <button
            onClick={() => dismissToast(t.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
