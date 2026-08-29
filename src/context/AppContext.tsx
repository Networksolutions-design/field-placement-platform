import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Application,
  ApplicationStatus,
  Company,
  CompanyDashboardStats,
  Student,
  Toast,
  University,
} from "@/types";

export interface ChecklistItem {
  id: string;
  text: string;
}
import { mockStudent, mockStudents } from "@/data/mockStudents";
import { mockCompanies } from "@/data/mockCompanies";
import { mockApplications } from "@/data/mockApplications";
import { mockUniversities } from "@/data/mockUniversities";

export interface ReportedProfile {
  id: string;
  companyId: string;
  reason: string;
  reportedBy: string;
  reportedAt: string;
}

export const DEFAULT_LETTER_TEMPLATE = `{contactPerson}
{companyName}
{poBox}

Dear {contactPerson},

I am writing to express my interest in the field placement opportunity at {companyName}. I am a {yearOfStudy} student pursuing {programme} at {university}.

I am particularly drawn to {companyName} because of {tagline}. I believe the practical exposure would strengthen my understanding and contribute to my academic growth.

I have attached my application letter, curriculum vitae and student ID as required. I am available for the {duration} placement period and am eager to contribute while learning.

Thank you for your consideration.

Sincerely,
{fullName}
{registrationNumber}
{phone}`;

interface AppContextValue {
  currentStudent: Student | null;
  currentCompany: Company | null;
  currentUniversity: University | null;
  savedCompanyIds: string[];
  applications: Application[];
  companyDashboard: CompanyDashboardStats;
  adminAuthed: boolean;
  toasts: Toast[];
  reportedProfiles: ReportedProfile[];
  companies: Company[];
  universities: University[];
  students: Student[];

  toggleSave: (companyId: string) => void;
  isSaved: (companyId: string) => boolean;
  applyToCompany: (
    companyId: string,
    applicationData: Partial<Pick<Application, "coverLetter" | "documents">>,
  ) => void;
  withdrawApplication: (applicationId: string) => void;
  getApplicationStatus: (companyId: string) => ApplicationStatus | null;
  updateStudentProfile: (partial: Partial<Student>) => void;
  updateCompanyProfile: (partial: Partial<Company>) => void;
  updateUniversityProfile: (partial: Partial<University>) => void;
  setStudent: (student: Student | null) => void;
  setCompany: (company: Company | null) => void;
  setUniversity: (university: University | null) => void;
  loginAdmin: () => void;
  logout: () => void;

  approveCompany: (companyId: string) => void;
  rejectCompany: (companyId: string, reason: string) => void;
  suspendCompany: (reportedId: string) => void;
  dismissReport: (reportedId: string) => void;
  markCompanyViewed: (companyId: string) => void;
  addCompany: (company: Company) => void;
  approveUniversity: (universityId: string) => void;
  rejectUniversity: (universityId: string, reason: string) => void;
  markUniversityViewed: (universityId: string) => void;
  addUniversity: (university: University) => void;
  approvalChecklist: ChecklistItem[];
  addChecklistItem: (text: string) => void;
  removeChecklistItem: (id: string) => void;
  letterTemplate: string;
  setLetterTemplate: (template: string) => void;
  resetLetterTemplate: () => void;

  logoutStudent: () => void;
  logoutCompany: () => void;
  logoutUniversity: () => void;

  showToast: (message: string, type?: Toast["type"]) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const seedSaved = ["c1", "c2", "c3"];

const STORAGE_KEYS = {
  saved: "tp_saved_companies",
  applications: "tp_applications",
  student: "tp_student_profile",
  studentSession: "platform_student_session",
  companySession: "platform_company_session",
  universitySession: "platform_university_session",
  checklist: "tp_admin_checklist",
  letterTemplate: "tp_letter_template",
} as const;

const seedChecklist: ChecklistItem[] = [
  { id: "cl1", text: "Physical address is verifiable" },
  { id: "cl2", text: "Contact phone/WhatsApp number is valid" },
  { id: "cl3", text: "Company description is clear and complete" },
  { id: "cl4", text: "At least one placement year is specified" },
  { id: "cl5", text: "Logo and cover image are uploaded" },
];

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore parse errors and fall back
  }
  return fallback;
}

function computeDashboard(applications: Application[]): CompanyDashboardStats {
  return {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    const session = loadStored<{
      profile: Student;
      onboardingComplete: boolean;
    } | null>(STORAGE_KEYS.studentSession, null);
    if (session && session.onboardingComplete) return session.profile;
    return loadStored<Student | null>(STORAGE_KEYS.student, mockStudent);
  });
  const [currentCompany, setCurrentCompany] = useState<Company | null>(() => {
    const session = loadStored<{ profile: Company } | null>(
      STORAGE_KEYS.companySession,
      null,
    );
    if (session) return session.profile;
    return mockCompanies[0];
  });
  const [savedCompanyIds, setSavedCompanyIds] = useState<string[]>(() =>
    loadStored<string[]>(STORAGE_KEYS.saved, seedSaved),
  );
  const [applications, setApplications] = useState<Application[]>(() =>
    loadStored<Application[]>(STORAGE_KEYS.applications, mockApplications),
  );
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [universities, setUniversities] = useState<University[]>(mockUniversities);
  const [students] = useState<Student[]>(mockStudents);
  const [currentUniversity, setCurrentUniversity] = useState<University | null>(() => {
    const session = loadStored<{ profile: University } | null>(
      STORAGE_KEYS.universitySession,
      null,
    );
    if (session) return session.profile;
    return null;
  });
  const [approvalChecklist, setApprovalChecklist] = useState<ChecklistItem[]>(
    () => loadStored<ChecklistItem[]>(STORAGE_KEYS.checklist, seedChecklist),
  );
  const [letterTemplate, setLetterTemplateState] = useState<string>(
    () => loadStored<string>(STORAGE_KEYS.letterTemplate, DEFAULT_LETTER_TEMPLATE),
  );
  const [reportedProfiles, setReportedProfiles] = useState<ReportedProfile[]>([
    {
      id: "r1",
      companyId: "c5",
      reason: "Misleading description — claims government affiliation",
      reportedBy: "Student: Neema J.",
      reportedAt: "2026-07-20",
    },
    {
      id: "r2",
      companyId: "c8",
      reason: "Contact email bounces, no response to applications",
      reportedBy: "Student: Baraka M.",
      reportedAt: "2026-07-22",
    },
  ]);

  const showToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleSave = useCallback(
    (companyId: string) => {
      setSavedCompanyIds((prev) => {
        if (prev.includes(companyId)) {
          showToast("Removed from saved", "info");
          return prev.filter((id) => id !== companyId);
        }
        showToast("Saved to your list", "success");
        return [...prev, companyId];
      });
    },
    [showToast],
  );

  const isSaved = useCallback(
    (companyId: string) => savedCompanyIds.includes(companyId),
    [savedCompanyIds],
  );

  const applyToCompany = useCallback(
    (
      companyId: string,
      applicationData: Partial<
        Pick<Application, "coverLetter" | "documents">
      >,
    ) => {
      const studentId = currentStudent?.id ?? "s1";
      const newApp: Application = {
        id: Math.random().toString(36).slice(2),
        companyId,
        studentId,
        status: "pending",
        appliedAt: new Date().toISOString().slice(0, 10),
        coverLetter: applicationData.coverLetter ?? "",
        documents: applicationData.documents ?? [],
      };
      setApplications((prev) => [...prev, newApp]);
      showToast("Application submitted!", "success");
    },
    [currentStudent, showToast],
  );

  const withdrawApplication = useCallback(
    (applicationId: string) => {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicationId ? { ...a, status: "withdrawn" } : a,
        ),
      );
      showToast("Application withdrawn", "info");
    },
    [showToast],
  );

  const getApplicationStatus = useCallback(
    (companyId: string): ApplicationStatus | null => {
      const studentId = currentStudent?.id ?? "s1";
      const app = applications.find(
        (a) => a.companyId === companyId && a.studentId === studentId,
      );
      return app?.status ?? null;
    },
    [applications, currentStudent],
  );

  const updateStudentProfile = useCallback((partial: Partial<Student>) => {
    setCurrentStudent((prev) =>
      prev ? { ...prev, ...partial } : prev,
    );
  }, []);

  const updateCompanyProfile = useCallback((partial: Partial<Company>) => {
    setCurrentCompany((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const updateUniversityProfile = useCallback((partial: Partial<University>) => {
    setCurrentUniversity((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const setStudent = useCallback((student: Student | null) => {
    setCurrentStudent(student);
  }, []);

  const setCompany = useCallback((company: Company | null) => {
    setCurrentCompany(company);
  }, []);

  const setUniversity = useCallback((university: University | null) => {
    setCurrentUniversity(university);
  }, []);

  const loginAdmin = useCallback(() => setAdminAuthed(true), []);
  const logout = useCallback(() => {
    setCurrentStudent(null);
    setCurrentCompany(null);
    setAdminAuthed(false);
  }, []);

  const approveCompany = useCallback(
    (companyId: string) => {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === companyId
            ? { ...c, verified: true, status: "live" as const }
            : c,
        ),
      );
      setCurrentCompany((prev) =>
        prev && prev.id === companyId
          ? { ...prev, verified: true, status: "live" as const }
          : prev,
      );
      showToast("Company approved and is now live", "success");
    },
    [showToast],
  );

  const rejectCompany = useCallback(
    (companyId: string, reason: string) => {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === companyId
            ? { ...c, verified: false, status: "inactive" as const }
            : c,
        ),
      );
      showToast(`Profile rejected: ${reason}`, "error");
    },
    [showToast],
  );

  const suspendCompany = useCallback(
    (reportedId: string) => {
      setReportedProfiles((prev) =>
        prev.filter((r) => r.id !== reportedId),
      );
      showToast("Profile suspended and report resolved", "error");
    },
    [showToast],
  );

  const dismissReport = useCallback(
    (reportedId: string) => {
      setReportedProfiles((prev) =>
        prev.filter((r) => r.id !== reportedId),
      );
      showToast("Report dismissed", "info");
    },
    [showToast],
  );

  const markCompanyViewed = useCallback((companyId: string) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, adminViewed: true } : c,
      ),
    );
  }, []);

  const addCompany = useCallback((company: Company) => {
    setCompanies((prev) => [...prev, company]);
  }, []);

  const approveUniversity = useCallback(
    (universityId: string) => {
      setUniversities((prev) =>
        prev.map((u) =>
          u.id === universityId
            ? { ...u, verified: true, status: "live" as const }
            : u,
        ),
      );
      setCurrentUniversity((prev) =>
        prev && prev.id === universityId
          ? { ...prev, verified: true, status: "live" as const }
          : prev,
      );
      showToast("University approved and is now live", "success");
    },
    [showToast],
  );

  const rejectUniversity = useCallback(
    (universityId: string, reason: string) => {
      setUniversities((prev) =>
        prev.map((u) =>
          u.id === universityId
            ? { ...u, verified: false, status: "inactive" as const }
            : u,
        ),
      );
      showToast(`Profile rejected: ${reason}`, "error");
    },
    [showToast],
  );

  const markUniversityViewed = useCallback((universityId: string) => {
    setUniversities((prev) =>
      prev.map((u) =>
        u.id === universityId ? { ...u, adminViewed: true } : u,
      ),
    );
  }, []);

  const addUniversity = useCallback((university: University) => {
    setUniversities((prev) => [...prev, university]);
  }, []);

  const addChecklistItem = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setApprovalChecklist((prev) => [
        ...prev,
        { id: Math.random().toString(36).slice(2), text: trimmed },
      ]);
      showToast("Checklist item added", "success");
    },
    [showToast],
  );

  const removeChecklistItem = useCallback(
    (id: string) => {
      setApprovalChecklist((prev) => prev.filter((item) => item.id !== id));
      showToast("Checklist item removed", "info");
    },
    [showToast],
  );

  const setLetterTemplate = useCallback(
    (template: string) => {
      setLetterTemplateState(template);
      showToast("Letter template saved", "success");
    },
    [showToast],
  );

  const resetLetterTemplate = useCallback(() => {
    setLetterTemplateState(DEFAULT_LETTER_TEMPLATE);
    showToast("Letter template reset to default", "info");
  }, [showToast]);

  const logoutStudent = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.studentSession);
      localStorage.removeItem(STORAGE_KEYS.student);
    } catch {
      // ignore
    }
    setCurrentStudent(null);
    showToast("Logged out", "info");
  }, [showToast]);

  const logoutCompany = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.companySession);
    } catch {
      // ignore
    }
    setCurrentCompany(null);
    showToast("Logged out", "info");
  }, [showToast]);

  const logoutUniversity = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.universitySession);
    } catch {
      // ignore
    }
    setCurrentUniversity(null);
    showToast("Logged out", "info");
  }, [showToast]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.checklist,
        JSON.stringify(approvalChecklist),
      );
    } catch {
      // storage may be unavailable; ignore
    }
  }, [approvalChecklist]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.letterTemplate,
        JSON.stringify(letterTemplate),
      );
    } catch {
      // storage may be unavailable; ignore
    }
  }, [letterTemplate]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(savedCompanyIds));
    } catch {
      // storage may be unavailable; ignore
    }
  }, [savedCompanyIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.applications,
        JSON.stringify(applications),
      );
    } catch {
      // storage may be unavailable; ignore
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.student,
        JSON.stringify(currentStudent),
      );
    } catch {
      // storage may be unavailable; ignore
    }
  }, [currentStudent]);

  // Persist student session when profile changes and onboarding is complete
  useEffect(() => {
    try {
      if (currentStudent && currentStudent.completedOnboarding) {
        localStorage.setItem(
          STORAGE_KEYS.studentSession,
          JSON.stringify({
            profile: currentStudent,
            onboardingComplete: true,
          }),
        );
      }
    } catch {
      // storage may be unavailable; ignore
    }
  }, [currentStudent, savedCompanyIds, applications]);

  // Persist company session when profile changes
  useEffect(() => {
    try {
      if (currentCompany) {
        localStorage.setItem(
          STORAGE_KEYS.companySession,
          JSON.stringify({ profile: currentCompany }),
        );
      }
    } catch {
      // storage may be unavailable; ignore
    }
  }, [currentCompany]);

  // Persist university session when profile changes
  useEffect(() => {
    try {
      if (currentUniversity) {
        localStorage.setItem(
          STORAGE_KEYS.universitySession,
          JSON.stringify({ profile: currentUniversity }),
        );
      }
    } catch {
      // storage may be unavailable; ignore
    }
  }, [currentUniversity]);

  const companyDashboard = useMemo(
    () => computeDashboard(applications),
    [applications],
  );

  const value: AppContextValue = {
    currentStudent,
    currentCompany,
    currentUniversity,
    savedCompanyIds,
    applications,
    companyDashboard,
    adminAuthed,
    toasts,
    reportedProfiles,
    companies,
    universities,
    students,
    toggleSave,
    isSaved,
    applyToCompany,
    withdrawApplication,
    getApplicationStatus,
    updateStudentProfile,
    updateCompanyProfile,
    updateUniversityProfile,
    setStudent,
    setCompany,
    setUniversity,
    loginAdmin,
    logout,
    approveCompany,
    rejectCompany,
    suspendCompany,
    dismissReport,
    markCompanyViewed,
    addCompany,
    approveUniversity,
    rejectUniversity,
    markUniversityViewed,
    addUniversity,
    approvalChecklist,
    addChecklistItem,
    removeChecklistItem,
    letterTemplate,
    setLetterTemplate,
    resetLetterTemplate,
    logoutStudent,
    logoutCompany,
    logoutUniversity,
    showToast,
    dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
