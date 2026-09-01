import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useApp } from "@/context/AppContext";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Mail, ArrowLeft, Chrome } from "lucide-react";

type Stage = "form" | "loading";

export function StudentSignup() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [stage, setStage] = useState<Stage>("form");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    terms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswordChecks, setShowPasswordChecks] = useState(false);

  const passwordChecks = {
    length: form.password.length >= 6,
    lower: /[a-z]/.test(form.password),
    upper: /[A-Z]/.test(form.password),
    number: /\d/.test(form.password),
    symbol: /[^a-zA-Z0-9]/.test(form.password),
  };

  const allPasswordChecksPass = Object.values(passwordChecks).every(Boolean);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Enter your full name";
    if (!form.email.trim()) e.email = "Enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.password) e.password = "Enter a password";
    else if (!allPasswordChecksPass) e.password = "Password does not meet requirements";
    if (!form.terms) e.terms = "You must accept the terms to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function getErrorMessage(error: unknown): string {
    const code = (error as { code?: string })?.code;
    if (code === "auth/email-already-in-use") return "This email is already registered.";
    if (code === "auth/invalid-email") return "Invalid email address.";
    if (code === "auth/weak-password") return "Password is too weak.";
    return "Failed to create account. Please try again.";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStage("loading");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password,
      );

      await sendEmailVerification(userCredential.user);

      await setDoc(doc(db, "students", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        university: "",
        course: "",
        yearOfStudy: "",
        bio: "",
        skills: [],
        languages: [],
        phone: "",
        portfolioUrl: "",
        expectedGraduationYear: null,
        photoUrl: null,
        featuredPhotoUrls: [],
        emailVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      showToast("Verification email sent", "success");
      navigate("/student/verify-email", { replace: true });
    } catch (error) {
      showToast(getErrorMessage(error), "error");
      setStage("form");
    }
  }

  async function handleGoogleSignIn() {
    setStage("loading");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) throw new Error("No email from Google account");

      const studentSnap = await getDoc(doc(db, "students", user.uid));

      if (!studentSnap.exists()) {
        await setDoc(doc(db, "students", user.uid), {
          uid: user.uid,
          email: user.email,
          fullName: user.displayName ?? "",
          university: "",
          course: "",
          yearOfStudy: "",
          bio: "",
          skills: [],
          languages: [],
          phone: "",
          portfolioUrl: "",
          expectedGraduationYear: null,
          photoUrl: user.photoURL ?? null,
          featuredPhotoUrls: [],
          emailVerified: user.emailVerified,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      if (user.emailVerified) {
        showToast("Google sign-in successful", "success");
        navigate("/student/onboarding");
      } else {
        showToast("Please verify your Google email and try again.", "error");
        setStage("form");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      showToast("Google sign-in failed. Please try again.", "error");
      setStage("form");
    }
  }

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your student account</h1>
        <p className="text-sm text-gray-500 mb-6">
          Start discovering field placements in minutes.
        </p>
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              name="fullName"
              placeholder="Amina Hassan"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              error={errors.fullName}
              disabled={stage === "loading"}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@students.uni.ac.tz"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              disabled={stage === "loading"}
            />
            <div>
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setShowPasswordChecks(true);
                }}
                error={errors.password}
                disabled={stage === "loading"}
              />
              {showPasswordChecks && (
                <div className="mt-2 space-y-1.5">
                  <PasswordRequirement label="At least 6 characters" met={passwordChecks.length} />
                  <PasswordRequirement label="One lowercase letter" met={passwordChecks.lower} />
                  <PasswordRequirement label="One uppercase letter" met={passwordChecks.upper} />
                  <PasswordRequirement label="One number" met={passwordChecks.number} />
                  <PasswordRequirement label="One symbol (!@#$...)" met={passwordChecks.symbol} />
                </div>
              )}
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-600">
                I agree to the{" "}
                <Link to="/terms" className="text-teal-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-teal-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.terms && <p className="text-xs text-red-500 -mt-2">{errors.terms}</p>}
            <Button
              type="submit"
              className="w-full"
              disabled={stage === "loading"}
            >
              {stage === "loading" ? (
                <>
                  <Spinner className="w-4 h-4" /> Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-400">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={stage === "loading"}
          >
            <Chrome className="w-4 h-4 mr-2" />
            Continue with Google
          </Button>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/student/login" className="text-teal-600 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </PublicLayout>
  );
}

function PasswordRequirement({ label, met }: { label: string; met: boolean }) {
  return (
    <p className={`text-xs flex items-center gap-1.5 ${met ? "text-green-600" : "text-red-500"}`}>
      <span className={`w-3 h-3 rounded-full flex items-center justify-center text-white ${met ? "bg-green-500" : "bg-red-400"}`}>
        {met ? "✓" : "!"}
      </span>
      {label}
    </p>
  );
}