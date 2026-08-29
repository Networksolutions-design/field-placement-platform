import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Spinner } from "@/components/ui/Spinner";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Chrome } from "lucide-react";

export function StudentLogin() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function getAuthErrorMessage(error: unknown): string {
    const code = (error as { code?: string })?.code;
    if (code === "auth/user-not-found") return "No account found with this email.";
    if (code === "auth/wrong-password") return "Incorrect password.";
    if (code === "auth/invalid-email") return "Invalid email address.";
    if (code === "auth/too-many-requests") return "Too many attempts. Please try again later.";
    return "Login failed. Please try again.";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
      showToast("Welcome back!", "success");
      navigate("/explore");
    } catch (error) {
      setError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) throw new Error("No email from Google account");

      const studentSnap = await getDoc(doc(db, "students", user.uid));

if (studentSnap.exists()) {
  const data = studentSnap.data() as Record<string, unknown>;

  if (data.course && data.university) {
    showToast("Welcome back!", "success");
    navigate("/explore");
    return;
  }

  showToast("Let's finish setting up your profile", "success");
  navigate("/student/onboarding");
  return;
}

// New Google account — create student profile
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

showToast("Google sign-in successful", "success");
navigate("/student/onboarding");
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="flex w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800 lg:max-w-4xl">
        {/* Left image column — hidden below lg */}
        <div
          className="hidden lg:block lg:w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/download_(1).jpg')",
            backgroundPosition: "80% center",
          }}
        />

        {/* Right form column */}
        <div className="w-full px-6 py-8 md:px-8 lg:w-1/2">
          {/* Wordmark */}
          <div className="flex justify-center mx-auto mb-1">
            <span className="text-2xl font-bold tracking-wide text-teal-600">
              the platform
            </span>
          </div>

          <p className="mt-2 text-xl text-center text-gray-600 dark:text-gray-200">
            Welcome back, Student
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="student-email"
                className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
              >
                Email Address
              </label>
              <input
                id="student-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading}
                className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-teal-500 focus:ring-opacity-40 dark:focus:border-teal-400 focus:outline-none focus:ring focus:ring-teal-300 transition-colors duration-200 disabled:opacity-60"
                placeholder="you@students.uni.ac.tz"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label
                  htmlFor="student-password"
                  className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                >
                  Password
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-300 mb-2 cursor-default select-none">
                  Forgot Password?
                </span>
              </div>
              <input
                id="student-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading}
                className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-teal-500 focus:ring-opacity-40 dark:focus:border-teal-400 focus:outline-none focus:ring focus:ring-teal-300 transition-colors duration-200 disabled:opacity-60"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-300 focus:ring-opacity-50 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner className="w-4 h-4" /> Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-400">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            <Chrome className="w-4 h-4" />
            Continue with Google
          </button>

          <div className="flex items-center justify-between mt-4">
            <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4" />
            <Link
              to="/student/signup"
              className="text-xs text-gray-500 uppercase dark:text-gray-400 hover:underline"
            >
              or sign up
            </Link>
            <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );
}