import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

type Role = "student" | "company" | "university" | "admin" | null;

interface AuthContextValue {
  firebaseUser: User | null;
  role: Role;
  profile: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  role: null,
  profile: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listens to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthInitialized(true);

      if (!user) {
        setRole(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return unsubscribeAuth;
  }, []);

  // Real-time role detection
  useEffect(() => {
    if (!firebaseUser) {
      setRole(null);
      setProfile(null);
      if (authInitialized) setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubs: Array<() => void> = [];

    const adminUnsub = onSnapshot(
      doc(db, "admins", firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          setRole("admin");
          setProfile(snap.data() as Record<string, unknown>);
          setLoading(false);
        }
      },
      () => setLoading(false)
    );
    unsubs.push(adminUnsub);

    const studentUnsub = onSnapshot(
      doc(db, "students", firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          setRole("student");
          setProfile(snap.data() as Record<string, unknown>);
          setLoading(false);
        }
      },
      () => setLoading(false)
    );
    unsubs.push(studentUnsub);

    const companyUnsub = onSnapshot(
      doc(db, "companies", firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          setRole("company");
          setProfile(snap.data() as Record<string, unknown>);
          setLoading(false);
        }
      },
      () => setLoading(false)
    );
    unsubs.push(companyUnsub);

    const universityUnsub = onSnapshot(
      doc(db, "universities", firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          setRole("university");
          setProfile(snap.data() as Record<string, unknown>);
          setLoading(false);
        }
      },
      () => setLoading(false)
    );
    unsubs.push(universityUnsub);

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [firebaseUser, authInitialized]);

  return (
    <AuthContext.Provider value={{ firebaseUser, role, profile, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);