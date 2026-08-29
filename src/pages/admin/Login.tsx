import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Shield, AlertCircle } from "lucide-react";

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Admin sessions are browser-session only — must log in fresh each time
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      // Check that this user is actually an admin
      const adminSnap = await getDoc(doc(db, "admins", userCredential.user.uid));

      if (!adminSnap.exists()) {
        // Not an admin — sign them out immediately
        await signOut(auth);
        setError("Access denied. This account is not an admin.");
        setSubmitting(false);
        return;
      }

      navigate("/admin/dashboard");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password") {
        setError("Invalid admin credentials.");
      } else if (code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto px-4 py-16">
        <Card className="p-8">
          <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 text-center mb-1">
            Admin Console
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Sign in to manage company approvals and platform reports.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="admin@theplatform.co.tz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in to Admin"}
            </Button>
          </form>

          <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500 text-center">
              Admin credentials were set during database seeding.
            </p>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}