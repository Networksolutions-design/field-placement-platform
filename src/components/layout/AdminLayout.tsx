import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, Shield } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  async function handleExit() {
    try {
      await signOut(auth);
    } catch {
      // ignore sign-out errors, still go home
    }
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">the platform</span>
            <span className="ml-2 text-xs font-medium text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
              Admin
            </span>
          </button>

          <button
            onClick={handleExit}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
          >
            <Shield className="w-4 h-4" />
            Exit
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}