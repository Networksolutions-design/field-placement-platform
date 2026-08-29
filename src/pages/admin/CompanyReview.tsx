import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Input";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import {
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MapPin,
  Mail,
  MessageCircle,
  Globe,
  Phone,
  Building2,
  GraduationCap,
  ListChecks,
  AlertTriangle,
  FileText,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Trash2,
} from "lucide-react";

type ChecklistItem = {
  id: string;
  label: string;
};

type CompanyView = {
  id: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  address: string;
  city: string;
  region: string;
  poBox: string;
  phone: string;
  whatsapp: string;
  contactEmail: string;
  companyEmail: string;
  website: string;
  socials: {
    linkedin?: string;
    instagram?: string;
    x?: string;
    facebook?: string;
  };
  eligibleYears: string[];
  preferredProgrammes: string[];
  extraRequirements: string;
  applicationMethod: string;
  availableSlots: number;
  logoUrl: string;
  coverUrl: string;
  status: string;
  authorisedRepConfirmed: boolean;
  registeredByAdmin: boolean;
  adminViewed: boolean;
  logoColor: string;
};

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v)) : [];
}

function normalizeCompany(doc: Record<string, unknown>): CompanyView {
  const socialsRaw = doc.socials as Record<string, unknown> | undefined;

  return {
    id: getString(doc.id),
    name: getString(doc.companyName ?? doc.name),
    tagline: getString(doc.tagline),
    category: getStringArray(doc.categories)[0] ?? "—",
    description: getString(doc.description),
    address: getString(doc.address),
    city: getString(doc.address),
    region: getString(doc.address),
    poBox: getString(doc.poBox),
    phone: getString(doc.phone),
    whatsapp: getString(doc.whatsapp),
    contactEmail: getString(doc.contactEmail),
    companyEmail: getString(doc.companyEmail),
    website: getString(doc.website),
    socials: {
      linkedin: socialsRaw ? getString(socialsRaw.linkedin) : undefined,
      instagram: socialsRaw ? getString(socialsRaw.instagram) : undefined,
      x: socialsRaw ? getString(socialsRaw.x) : undefined,
      facebook: socialsRaw ? getString(socialsRaw.facebook) : undefined,
    },
    eligibleYears: getStringArray(doc.eligibleYears),
    preferredProgrammes: getStringArray(doc.preferredProgrammes),
    extraRequirements: getString(doc.extraRequirements),
    applicationMethod: getString(doc.applicationMethod),
    availableSlots: Number(doc.availableSlots ?? 0),
    logoUrl: getString(doc.logoUrl),
    coverUrl: getString(doc.coverUrl),
    status: getString(doc.status),
    authorisedRepConfirmed: Boolean(doc.authorisedRepConfirmed),
    registeredByAdmin: Boolean(doc.registeredByAdmin),
    adminViewed: Boolean(doc.adminViewed),
    logoColor: "#0d9488",
  };
}

export function AdminCompanyReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companies } = useData();
  const { firebaseUser } = useAuth();

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const companyDoc = companies.find((c) => c.id === id) as
    | Record<string, unknown>
    | undefined;
  const company = companyDoc ? normalizeCompany(companyDoc) : null;

  useEffect(() => {
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
          setChecklist(items);
        } else {
          setChecklist([]);
        }
      },
      () => setChecklist([])
    );
    return unsub;
  }, []);

  if (!company) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-sm text-gray-500 mb-4">Company not found.</p>
          <Button size="sm" onClick={() => navigate("/admin/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const fullAddress = `${company.address}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullAddress
  )}`;
  const whatsappNumber = company.whatsapp.replace(/\D/g, "");
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;
  const emailUrl = `mailto:${company.contactEmail || company.companyEmail}`;
  const websiteUrl = company.website?.startsWith("http")
    ? company.website
    : `https://${company.website}`;

  const allChecked =
    checklist.length > 0 && checklist.every((item) => checked[item.id]);

  async function logAction(action: string, companyName: string, details?: string) {
    if (!firebaseUser) return;
    try {
      await addDoc(collection(db, "activityLogs"), {
        action,
        companyId: id,
        companyName,
        adminEmail: firebaseUser.email ?? "unknown",
        adminUid: firebaseUser.uid,
        details: details ?? null,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to log action:", error);
    }
  }

  async function handleApprove() {
    if (!id || !company) return;
    await updateDoc(doc(db, "companies", id), {
      status: "approved",
      adminViewed: true,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await logAction("approved", company.name);
    navigate("/admin/dashboard");
  }

  async function handleReject() {
    if (!rejectReason.trim() || !id || !company) return;
    await updateDoc(doc(db, "companies", id), {
      status: "rejected",
      rejectionReason: rejectReason,
      adminViewed: true,
      updatedAt: serverTimestamp(),
    });
    await logAction("rejected", company.name, rejectReason);
    navigate("/admin/dashboard");
  }

  async function handleSuspend() {
    if (!id || !company) return;
    await updateDoc(doc(db, "companies", id), {
      status: "suspended",
      updatedAt: serverTimestamp(),
    });
    await logAction("suspended", company.name);
    navigate("/admin/dashboard");
  }

  async function handleDelete() {
    if (!id || !company) return;
    await deleteDoc(doc(db, "companies", id));
    await logAction("deleted", company.name);
    navigate("/admin/dashboard");
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt=""
              className="w-14 h-14 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0 bg-teal-600">
              {company.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                {company.name}
              </h1>
              <Badge variant="amber">Pending</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{company.tagline}</p>
          </div>
        </div>

        {/* Contact actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline">
              <MapPin className="w-4 h-4" /> Go to Location
            </Button>
          </a>
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </Button>
            </a>
          )}
          <a href={emailUrl}>
            <Button size="sm" variant="outline">
              <Mail className="w-4 h-4" /> Email
            </Button>
          </a>
          {company.website && (
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                <Globe className="w-4 h-4" /> Website
              </Button>
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                Company overview
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {company.description}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="Category" value={company.category} />
                <Detail
                  label="Authorised rep confirmed"
                  value={company.authorisedRepConfirmed ? "Yes" : "No"}
                />
                <Detail
                  label="Registered by admin"
                  value={company.registeredByAdmin ? "Yes" : "No"}
                />
                <Detail
                  label="Positions available"
                  value={String(company.availableSlots)}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                Location & contact
              </h2>
              <div className="space-y-2 text-sm">
                <ContactRow icon={MapPin} label="Address" value={fullAddress} />
                {company.poBox && (
                  <ContactRow icon={Mail} label="P.O. Box" value={company.poBox} />
                )}
                {company.phone && (
                  <ContactRow icon={Phone} label="Phone" value={company.phone} />
                )}
                {company.whatsapp && (
                  <ContactRow
                    icon={MessageCircle}
                    label="WhatsApp"
                    value={company.whatsapp}
                    href={whatsappUrl ?? undefined}
                  />
                )}
                <ContactRow
                  icon={Mail}
                  label="Contact Email"
                  value={company.contactEmail || company.companyEmail}
                  href={emailUrl}
                />
                {company.website && (
                  <ContactRow
                    icon={Globe}
                    label="Website"
                    value={company.website}
                    href={websiteUrl}
                  />
                )}
              </div>
            </Card>

            {/* Social links */}
            {company.socials &&
              (company.socials.linkedin ||
                company.socials.x ||
                company.socials.instagram ||
                company.socials.facebook) && (
              <Card className="p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-600" />
                  Social media links
                </h2>
                <div className="flex flex-wrap gap-3">
                  {company.socials.linkedin && (
                    <SocialLink href={company.socials.linkedin} Icon={Linkedin} />
                  )}
                  {company.socials.x && (
                    <SocialLink href={company.socials.x} Icon={Twitter} />
                  )}
                  {company.socials.instagram && (
                    <SocialLink href={company.socials.instagram} Icon={Instagram} />
                  )}
                  {company.socials.facebook && (
                    <SocialLink href={company.socials.facebook} Icon={Facebook} />
                  )}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                Placement criteria
              </h2>
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Eligible years
                </p>
                <div className="flex flex-wrap gap-2">
                  {company.eligibleYears.length > 0 ? (
                    company.eligibleYears.map((y) => (
                      <Badge key={y} variant="teal">
                        {y}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">Not set</span>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Preferred programmes
                </p>
                <div className="flex flex-wrap gap-2">
                  {company.preferredProgrammes.length > 0 ? (
                    company.preferredProgrammes.map((p) => (
                      <Badge key={p} variant="gray">
                        {p}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">Not set</span>
                  )}
                </div>
              </div>
              {company.extraRequirements && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Extra requirements
                  </p>
                  <p className="text-sm text-gray-600">{company.extraRequirements}</p>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                Application method
              </h2>
              <p className="text-sm text-gray-700">
                {company.applicationMethod === "email_whatsapp"
                  ? "Email or WhatsApp a scanned copy"
                  : company.applicationMethod === "office_visit"
                    ? "Drop off a hard-copy letter at our office"
                    : "Not specified"}
              </p>
            </Card>
          </div>

          {/* Sidebar: checklist + actions */}
          <div className="space-y-6">
            <Card className="p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-teal-600" />
                Review checklist
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Tick off each item as you verify it for this company.
              </p>
              {checklist.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">
                  No checklist items defined.
                </p>
              ) : (
                <ul className="space-y-1">
                  {checklist.map((item) => (
                    <li key={item.id}>
                      <label className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checked[item.id]}
                          onChange={(e) =>
                            setChecked((prev) => ({
                              ...prev,
                              [item.id]: e.target.checked,
                            }))
                          }
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              {checklist.length > 0 && (
                <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                  {allChecked
                    ? "All items confirmed."
                    : `${checklist.filter((i) => !checked[i.id]).length} item(s) remaining.`}
                </p>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Decision
              </h2>
              {!rejecting ? (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (allChecked) {
                        handleApprove();
                      } else {
                        setShowApproveConfirm(true);
                      }
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve company
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setRejecting(true)}
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>

                  {company.status === "approved" && (
                    <Button
                      variant="outline"
                      className="w-full text-amber-600 border-amber-200 hover:bg-amber-50"
                      onClick={() => setShowSuspendConfirm(true)}
                    >
                      <AlertTriangle className="w-4 h-4" /> Suspend / Unapprove
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full text-gray-600 border-gray-200 hover:bg-gray-50"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4" /> Delete Company
                  </Button>
                </div>
              ) : (
                <div className="animate-[fadeIn_0.2s_ease-out]">
                  <Textarea
                    label="Reason for rejection"
                    name="rejectReason"
                    placeholder="e.g. Missing business registration document..."
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1"
                      onClick={() => {
                        setRejecting(false);
                        setRejectReason("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={handleReject}
                      disabled={!rejectReason.trim()}
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Approve confirmation modal */}
      {showApproveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="p-6 max-w-sm w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Approve anyway?
                </h3>
                <p className="text-sm text-gray-500">
                  Not all checklist items are confirmed. Approve anyway?
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowApproveConfirm(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleApprove}>
                Approve anyway
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Suspend confirm dialog */}
      {showSuspendConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="p-6 max-w-sm w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Suspend company?
                </h3>
                <p className="text-sm text-gray-500">
                  This will remove the company from student browse results. You
                  can re-approve later.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowSuspendConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700"
                onClick={handleSuspend}
              >
                Suspend
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete confirm dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="p-6 max-w-sm w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Delete company permanently?
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. The company profile and any
                  associated data will be removed.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-700">{value}</p>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <span className="text-xs text-gray-400 mr-1.5">{label}:</span>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-teal-600 font-medium break-words hover:underline"
          >
            {value}
          </a>
        ) : (
          <span className="text-sm text-gray-700 break-words">{value}</span>
        )}
      </div>
    </div>
  );
}

function SocialLink({
  href,
  Icon,
}: {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}