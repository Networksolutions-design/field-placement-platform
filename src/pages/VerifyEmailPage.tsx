import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Mail, CheckCircle2 } from "lucide-react";

export function VerifyEmailPage() {
  const { firebaseUser, role, refreshEmailVerified } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);

  function getRedirectPath(): string {
    if (role === "company") return "/company/dashboard";
    if (role === "university") return "/university/dashboard";
    return "/student/onboarding";
  }

  useEffect(() => {
    if (verified) return;
    const interval = setInterval(async () => {
      const ok = await refreshEmailVerified();
      if (ok) {
        setVerified(true);
        clearInterval(interval);
        navigate(getRedirectPath(), { replace: true });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [verified, role, navigate, refreshEmailVerified]);

  async function handleCheckNow() {
    setChecking(true);
    const ok = await refreshEmailVerified();
    setChecking(false);
    if (ok) {
      setVerified(true);
      navigate(getRedirectPath(), { replace: true });
    } else {
      showToast("Not verified yet — click the link in your email first.", "error");
    }
  }

  async function handleResend() {
    if (!firebaseUser) return;
    try {
      await sendEmailVerification(firebaseUser);
      showToast("Verification email resent", "success");
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      showToast(
        code === "auth/too-many-requests"
          ? "Please wait a bit before requesting another email."
          : "Couldn't resend — try again shortly.",
        "error"
      );
    }
  }

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-7 h-7 text-teal-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Check your email
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            We sent a verification link to{" "}
            <span className="font-medium text-gray-900">
              {firebaseUser?.email ?? "your email"}
            </span>
            . Click it, then come back here.
          </p>
          <Button
            className="w-full"
            onClick={handleCheckNow}
            disabled={checking}
          >
            <CheckCircle2 className="w-4 h-4" />
            {checking ? "Checking..." : "I've verified — continue"}
          </Button>
          <button
            onClick={handleResend}
            className="mt-3 text-sm text-teal-600 font-medium hover:underline"
          >
            Resend verification email
          </button>
          <p className="text-xs text-gray-400 mt-4">
            Didn't receive it? Check your spam folder and mark it as “Not spam” so future emails go to your inbox.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}