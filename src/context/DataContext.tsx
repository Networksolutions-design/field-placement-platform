import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './authcontext.tsx';

interface DataContextValue {
  companies: Record<string, unknown>[];
  universities: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  savedCompanyIds: string[];
  appliedCompanyIds: string[];
  letterTemplate: string;
  loading: boolean;
}

const DataContext = createContext<DataContextValue>({
  companies: [],
  universities: [],
  categories: [],
  savedCompanyIds: [],
  appliedCompanyIds: [],
  letterTemplate: '',
  loading: true,
});

export function DataProvider({ children }: { children: ReactNode }) {
  const { firebaseUser, role } = useAuth();
  const [companies, setCompanies] = useState<Record<string, unknown>[]>([]);
  const [universities, setUniversities] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [savedCompanyIds, setSavedCompanyIds] = useState<string[]>([]);
  const [appliedCompanyIds, setAppliedCompanyIds] = useState<string[]>([]);
  const [letterTemplate, setLetterTemplate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmin = role === 'admin';
    const q = isAdmin
      ? collection(db, 'companies')
      : query(collection(db, 'companies'), where('status', '==', 'approved'));
    const unsub = onSnapshot(q, (snap) => {
      setCompanies(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Record<string, unknown>));
    });
    return unsub;
  }, [role]);

  useEffect(() => {
    const isAdmin = role === 'admin';
    const q = isAdmin
      ? collection(db, 'universities')
      : query(collection(db, 'universities'), where('status', '==', 'approved'));
    const unsub = onSnapshot(q, (snap) => {
      setUniversities(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Record<string, unknown>));
    });
    return unsub;
  }, [role]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'categories'), (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Record<string, unknown>));
    });
    return unsub;
  }, []);

  useEffect(() => {
    getDoc(doc(db, 'settings', 'letterTemplate')).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && typeof data.template === 'string') {
          setLetterTemplate(data.template);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!firebaseUser || role !== 'student') {
      setSavedCompanyIds([]);
      setAppliedCompanyIds([]);
      return;
    }
    const savedQ = query(collection(db, 'savedCompanies'), where('studentId', '==', firebaseUser.uid));
    const unsubSaved = onSnapshot(savedQ, (snap) => {
      setSavedCompanyIds(snap.docs.map(d => String(d.data().companyId)));
    });
    const appliedQ = query(collection(db, 'applications'), where('studentId', '==', firebaseUser.uid));
    const unsubApplied = onSnapshot(appliedQ, (snap) => {
      setAppliedCompanyIds(snap.docs.map(d => String(d.data().companyId)));
    });
    return () => { unsubSaved(); unsubApplied(); };
  }, [firebaseUser, role]);

  useEffect(() => {
    setLoading(false);
  }, [companies, universities, categories]);

  return (
    <DataContext.Provider value={{ companies, universities, categories, savedCompanyIds, appliedCompanyIds, letterTemplate, loading }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);