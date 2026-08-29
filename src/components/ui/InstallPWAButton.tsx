import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import {
  getDeferredPrompt,
  clearDeferredPrompt,
} from "@/lib/pwaPrompt";

export function InstallPWAButton() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const prompt = getDeferredPrompt();
    if (prompt) {
      setCanInstall(true);
    }

    const handleInstalled = () => {
      setIsInstalled(true);
      clearDeferredPrompt();
      setCanInstall(false);
    };

    window.addEventListener("appinstalled", handleInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstallClick() {
    const prompt = getDeferredPrompt();
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") {
      clearDeferredPrompt();
      setIsInstalled(true);
      setCanInstall(false);
    }
  }

  if (!canInstall || isInstalled) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 bg-white border border-teal-600 rounded-lg px-3 py-2 hover:bg-teal-50 transition-colors"
    >
      <Download className="w-4 h-4" />
      Install App
    </button>
  );
}