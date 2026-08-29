import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import {
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  CheckCircle2,
  XCircle,
  Flag,
  Ban,
  Clock,
  MapPin,
  ChevronRight,
  Building2,
  CircleDot,
  ListChecks,
  Plus,
  X,
  FileText,
  RotateCcw,
  Save,
} from "lucide-react";

const DEFAULT_LETTER_TEMPLATE = `Dear Hiring Manager,\n\nMy name is {studentName}, a {course} student at {university}. I am writing to express my interest in a field placement opportunity at {companyName}, located at {companyAddress}.\n\nSincerely,\n{studentName}`;

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v)) : [];
}

type AdminCompany = {
  id: string;
  name: string;
  tagline: string;
  category: string;
  city: string;
  email: string;
  status: string;
  logoColor: string;
  adminViewed: boolean;
};

type AdminUniversity = {
  id: string;
  name: string;
  acronym: string;
  universityType: string;
  tcuRegistrationNumber: string;
  address: string;
  email: string;
  status: string;
  logoColor: string;
  adminViewed: boolean;
};

type ChecklistItem = {
  id: string;
  label: string;
};

type Report = {
  id: string;
  companyId: string;
  reason: string;
  details: string;
  status: string;
  createdAt: string;
  reporterId: string;
};

type ActivityLog = {
  id: string;
  action: string;
  companyName: string;
  companyId: string;
  adminEmail: string;
  details: string | null;
  timestamp: string;
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const { firebaseUser, role, loading: authLoading } = useAuth();
  const { companies, universities } = useData();

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [letterDraft, setLetterDraft] = useState(DEFAULT_LETTER_TEMPLATE);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [savedLetterTemplate, setSavedLetterTemplate] = useState(DEFAULT_LETTER_TEMPLATE);
  const [reports, setReports] = useState<Report[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!firebaseUser || role !== "admin")) {
      setIsRedirecting(true);
      navigate("/admin/login");
    }
  }, [authLoading, firebaseUser, role, navigate]);

  useEffect(() => {
    if (role !== "admin") return;
    const unsub = onSnapshot(
      doc(db, "settings", "approvalChecklist"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const items = Array.isArray(data.items)
            ? data.items.map((item: unknown) => {
                const obj = item as Record<string, unknown>;
                return {
                  id: getString(obj.id),
                  label: getString(obj.label ?? obj.text),
                };
              })
            : [];
          setChecklistItems(items);
        } else {
          setChecklistItems([]);
        }
      },
      () => setChecklistItems([])
    );
    return unsub;
  }, [role]);

  useEffect(() => {
    if (role !== "admin") return;
    const unsub = onSnapshot(
      doc(db, "settings", "letterTemplate"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const template = getString(data.template);
          setSavedLetterTemplate(template || DEFAULT_LETTER_TEMPLATE);
          setLetterDraft(template || DEFAULT_LETTER_TEMPLATE);
        } else {
          setSavedLetterTemplate(DEFAULT_LETTER_TEMPLATE);
          setLetterDraft(DEFAULT_LETTER_TEMPLATE);
        }
      },
      () => {
        setSavedLetterTemplate(DEFAULT_LETTER_TEMPLATE);
        setLetterDraft(DEFAULT_LETTER_TEMPLATE);
      }
    );
    return unsub;
  }, [role]);

  useEffect(() => {
    if (role !== "admin") return;
    const unsub = onSnapshot(
      collection(db, "reports"),
      (snap) => {
        const mapped: Report[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            companyId: getString(data.companyId),
            reason: getString(data.reason),
            details: getString(data.details),
            status: getString(data.status),
            createdAt: data.createdAt?.toDate?.().toLocaleDateString() ?? "Unknown date",
            reporterId: getString(data.reporterId),
          };
        });
        setReports(mapped);
      },
      () => setReports([])
    );
    return unsub;
  }, [role]);

  useEffect(() => {
    if (role !== "admin") return;
    const unsub = onSnapshot(
      query(collection(db, "activityLogs"), orderBy("timestamp", "desc")),
      (snap) => {
        const logs = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            action: getString(data.action),
            companyName: getString(data.companyName),
            companyId: getString(data.companyId),
            adminEmail: getString(data.adminEmail),
            details: data.details ? getString(data.details) : null,
            timestamp:
              data.timestamp?.toDate?.()?.toLocaleString() ?? "Unknown time",
          };
        });
        setActivityLogs(logs);
      },
      () => setActivityLogs([])
    );
    return unsub;
  }, [role]);

  if (authLoading || isRedirecting) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <p className="text-gray-500">Loading admin dashboard…</p>
        </div>
      </AdminLayout>
    );
  }

  if (!firebaseUser || role !== "admin") {
    return null;
  }

  const companyList: AdminCompany[] = companies.map((c) => {
    const data = c as Record<string, unknown>;
    return {
      id: getString(data.id),
      name: getString(data.companyName ?? data.name),
      tagline: getString(data.tagline),
      category: getStringArray(data.categories)[0] ?? "—",
      city: getString(data.address),
      email: getString(data.contactEmail ?? data.companyEmail),
      status: getString(data.status),
      logoColor: "#0d9488",
      adminViewed: Boolean(data.adminViewed),
    };
  });

  const universityList: AdminUniversity[] = universities.map((u) => {
    const data = u as Record<string, unknown>;
    return {
      id: getString(data.id),
      name: getString(data.universityName ?? data.name),
      acronym: getString(data.acronym),
      universityType: getString(data.universityType),
      tcuRegistrationNumber: getString(data.tcuRegistrationNumber),
      address: getString(data.address),
      email: getString(data.universityEmail ?? data.email),
      status: getString(data.status),
      logoColor: "#0d9488",
      adminViewed: Boolean(data.adminViewed),
    };
  });

  const pendingCompanies = companyList.filter((c) => c.status === "pending");
  const liveCompanies = companyList.filter((c) => c.status === "approved");
  const suspendedCompanies = companyList.filter((c) => c.status === "suspended");

  const pendingUniversities = universityList.filter((u) => u.status === "pending");
  const liveUniversities = universityList.filter((u) => u.status === "approved");

  const newPendingCount =
    pendingCompanies.filter((c) => !c.adminViewed).length +
    pendingUniversities.filter((u) => !u.adminViewed).length;

  const totalInstitutions = companyList.length + universityList.length;
  const totalLive = liveCompanies.length + liveUniversities.length;
  const totalPending = pendingCompanies.length + pendingUniversities.length;

  const letterDirty = letterDraft !== savedLetterTemplate;

  async function approveCompany(id: string) {
    await updateDoc(doc(db, "companies", id), {
      status: "approved",
      adminViewed: true,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function rejectCompany(id: string) {
    await updateDoc(doc(db, "companies", id), {
      status: "rejected",
      rejectionReason: rejectReason,
      adminViewed: true,
      updatedAt: serverTimestamp(),
    });
  }

  async function approveUniversity(id: string) {
    await updateDoc(doc(db, "universities", id), {
      status: "approved",
      adminViewed: true,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function rejectUniversity(id: string) {
    await updateDoc(doc(db, "universities", id), {
      status: "rejected",
      rejectionReason: rejectReason,
      adminViewed: true,
      updatedAt: serverTimestamp(),
    });
  }

  async function suspendCompany(id: string) {
    await updateDoc(doc(db, "companies", id), {
      status: "suspended",
      updatedAt: serverTimestamp(),
    });
  }

  async function markCompanyViewed(id: string) {
    await updateDoc(doc(db, "companies", id), {
      adminViewed: true,
      updatedAt: serverTimestamp(),
    });
  }

  async function markUniversityViewed(id: string) {
    await updateDoc(doc(db, "universities", id), {
      adminViewed: true,
      updatedAt: serverTimestamp(),
    });
  }

  async function addChecklistItem(text: string) {
    if (!text.trim()) return;
    const newItem = { id: Date.now().toString(), label: text.trim() };
    const newItems = [...checklistItems, newItem];
    await setDoc(
      doc(db, "settings", "approvalChecklist"),
      { items: newItems },
      { merge: true }
    );
    setChecklistInput("");
  }

  async function removeChecklistItem(itemId: string) {
    const newItems = checklistItems.filter((item) => item.id !== itemId);
    await setDoc(
      doc(db, "settings", "approvalChecklist"),
      { items: newItems },
      { merge: true }
    );
  }

  async function saveLetterTemplate() {
    await setDoc(
      doc(db, "settings", "letterTemplate"),
      { template: letterDraft, updatedAt: serverTimestamp(), updatedBy: "admin" },
      { merge: true }
    );
  }

  async function resetLetterTemplate() {
    setLetterDraft(DEFAULT_LETTER_TEMPLATE);
    await setDoc(
      doc(db, "settings", "letterTemplate"),
      { template: DEFAULT_LETTER_TEMPLATE, updatedAt: serverTimestamp(), updatedBy: "admin" },
      { merge: true }
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          Admin Dashboard
          {newPendingCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-semibold">
              {newPendingCount}
            </span>
          )}
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Review company and university approvals and manage reported profiles.
        </p>

        {/* Overview stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total Institutions", value: totalInstitutions, color: "text-teal-600 bg-teal-50", Icon: Building2 },
            { label: "Live", value: totalLive, color: "text-green-600 bg-green-50", Icon: CheckCircle2 },
            { label: "Pending Review", value: totalPending, color: "text-amber-600 bg-amber-50", Icon: Clock },
            { label: "Reports", value: reports.length, color: "text-red-600 bg-red-50", Icon: Flag },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
                <s.Icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Pending approvals queue */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending approvals
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/admin/add-company")}
            >
              <Plus className="w-4 h-4" /> Add company
            </Button>
          </div>
          {pendingCompanies.length === 0 && pendingUniversities.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No institutions waiting for approval. You're all caught up.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingCompanies.map((company) => (
                <Card
                  key={company.id}
                  className="p-5 hover:border-teal-200 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => {
                    markCompanyViewed(company.id);
                    navigate(`/admin/company/${company.id}`);
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0 bg-teal-600">
                        {company.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {company.name}
                          </h3>
                          <Badge variant="teal">Company</Badge>
                          <Badge variant="amber">Pending</Badge>
                          {!company.adminViewed && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 uppercase tracking-wide">
                              <CircleDot className="w-2.5 h-2.5" /> New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {company.tagline}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>{company.category}</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {company.city}
                          </span>
                          <span>{company.email}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        onClick={() => approveCompany(company.id)}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setRejectingId(company.id)}
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  </div>

                  {rejectingId === company.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-[fadeIn_0.2s_ease-out]">
                      <Textarea
                        label="Reason for rejection"
                        name="rejectReason"
                        placeholder="e.g. Missing business registration document..."
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            rejectCompany(company.id);
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                          disabled={!rejectReason.trim()}
                        >
                          Confirm rejection
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}

              {pendingUniversities.map((uni) => (
                <Card
                  key={uni.id}
                  className="p-5 hover:border-teal-200 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => {
                    markUniversityViewed(uni.id);
                    navigate(`/admin/university/${uni.id}`);
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0 bg-blue-600">
                        {uni.acronym.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {uni.name}
                          </h3>
                          <Badge variant="blue">University</Badge>
                          <Badge variant="amber">Pending</Badge>
                          {!uni.adminViewed && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 uppercase tracking-wide">
                              <CircleDot className="w-2.5 h-2.5" /> New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {uni.acronym} · {uni.universityType} University
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>{uni.tcuRegistrationNumber}</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {uni.address}
                          </span>
                          <span>{uni.email}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        onClick={() => approveUniversity(uni.id)}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setRejectingId(uni.id)}
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  </div>

                  {rejectingId === uni.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-[fadeIn_0.2s_ease-out]">
                      <Textarea
                        label="Reason for rejection"
                        name="rejectReason"
                        placeholder="e.g. TCU registration could not be verified..."
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            rejectUniversity(uni.id);
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                          disabled={!rejectReason.trim()}
                        >
                          Confirm rejection
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Suspended companies */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Suspended companies
          </h2>
          {suspendedCompanies.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-gray-500">No suspended companies.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {suspendedCompanies.map((company) => (
                <Card key={company.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold">
                      {company.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {company.name}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/company/${company.id}`)}
                  >
                    Review
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Approval checklist */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-teal-600" />
            Approval checklist
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Define what reviewers should verify before approving a company.
          </p>
          <Card className="p-5">
            {checklistItems.length > 0 && (
              <ul className="space-y-2 mb-4">
                {checklistItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                      <span className="text-sm text-gray-700 truncate">
                        {item.label}
                      </span>
                    </div>
                    <button
                      onClick={() => removeChecklistItem(item.id)}
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label="Remove checklist item"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addChecklistItem(checklistInput);
                  }
                }}
                placeholder="Add a checklist item..."
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <Button
                size="sm"
                onClick={() => addChecklistItem(checklistInput)}
                disabled={!checklistInput.trim()}
              >
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </div>
          </Card>
        </section>

        {/* Application letter template */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Application letter template
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This is the default application letter shown to students. Use placeholders like{" "}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{"{companyName}"}</code>{" "}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{"{studentName}"}</code>, etc.
          </p>
          <Card className="p-5">
            <textarea
              value={letterDraft}
              onChange={(e) => setLetterDraft(e.target.value)}
              rows={16}
              className="w-full text-sm font-serif leading-relaxed border border-gray-200 rounded-lg px-3 py-2.5 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y"
            />
            <div className="flex items-center justify-between gap-2 mt-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={resetLetterTemplate}
              >
                <RotateCcw className="w-4 h-4" /> Reset to default
              </Button>
              <Button
                size="sm"
                onClick={saveLetterTemplate}
                disabled={!letterDirty}
              >
                <Save className="w-4 h-4" /> Save Template
              </Button>
            </div>
          </Card>
        </section>

        {/* Reported profiles */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Reported profiles
          </h2>
          {reports.length === 0 ? (
            <Card className="p-8 text-center">
              <Flag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No reported profiles. Everything looks clean.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => {
                const company = companyList.find((c) => c.id === report.companyId);
                if (!company) return null;
                return (
                  <Card key={report.id} className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                          <Flag className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {company.name}
                            </h3>
                            <Badge variant="red">Reported</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {report.reason}
                          </p>
                          <p className="text-xs text-gray-400 mt-1.5">
                            Reported on {report.createdAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDoc(
                              doc(db, "reports", report.id),
                              { status: "reviewed" },
                              { merge: true }
                            );
                          }}
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => suspendCompany(report.companyId)}
                        >
                          <Ban className="w-4 h-4" /> Suspend
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Activity logs */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent admin activity
          </h2>
          {activityLogs.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-gray-500">No activity recorded yet.</p>
            </Card>
          ) : (
            <Card className="divide-y divide-gray-100">
              {activityLogs.slice(0, 20).map((log) => (
                <div key={log.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="gray">{log.action}</Badge>
                    <span className="text-sm font-medium text-gray-700">
                      {log.companyName}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {log.adminEmail} · {log.timestamp}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </section>

        {/* All companies quick list */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            All companies
          </h2>
          <Card className="divide-y divide-gray-50">
            {companyList.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/admin/company/${company.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-teal-600">
                    {company.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {company.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      company.status === "approved"
                        ? "green"
                        : company.status === "pending"
                          ? "amber"
                          : "gray"
                    }
                  >
                    {company.status}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </AdminLayout>
  );
}