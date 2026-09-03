import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Layers } from "lucide-react";
import { InstallPWAButton } from "@/components/ui/InstallPWAButton";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">the platform</span>
          </Link>

          <div className="flex items-center gap-3">
            <InstallPWAButton />
            <Link
              to="/explore"
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              Browse
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-500">the platform</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/terms" className="hover:text-gray-800">Terms</Link>
            <Link to="/privacy" className="hover:text-gray-800">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}