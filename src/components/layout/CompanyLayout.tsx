import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Layers, LayoutDashboard } from "lucide-react";

export function CompanyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 hidden sm:block">the platform</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/company/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-teal-50 text-teal-700"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 pb-20 sm:pb-0">{children}</main>
    </div>
  );
}
