import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bookmark,
  BookmarkCheck,
  BadgeCheck,
  Flag,
  MessageCircle,
  Mail,
  Globe,
  Copy,
  CheckCircle2,
  FileText,
  X,
  MapPin,
  AlertTriangle,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
} from "lucide-react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { UniversityBrowseLayout } from "@/components/layout/UniversityBrowseLayout";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import {
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { incrementCompanyStat } from "@/lib/stats";
import { GraduationCap } from "lucide-react";

type Tab = "details" | "location";

type StudentProfileData = {
  fullName?: string;
  university?: string;
  programme?: string;
  yearOfStudy?: string;
  registrationNumber?: string;
  phone?: string;
};

type CompanyView = {
  id: string;
  name: string;
  logoUrl: string;
  coverUrl: string;
  verified: boolean;
  tagline: string;
  description: string;
  category: string;
  preferredProgrammes: string[];
  acceptedYears: string[];
  additionalRequirements: string;
  poBox: string;
  address: string;
  city: string;
  region: string;
  whatsapp: string;
  email: string;
  website: string;
  socials: {
    linkedin?: string;
    instagram?: string;
    x?: string;
    facebook?: string;
  };
  applicationMethod: string;
  availableSlots: number;
  status: string;
  logoColor: string;
};

type CompanyStatsData = {
  totalViews?: number;
  totalSaves?: number;
  totalApplied?: number;
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
    logoUrl: getString(doc.logoUrl),
    coverUrl: getString(doc.coverUrl),
    verified: doc.status === "approved",
    tagline: getString(doc.tagline),
    description: getString(doc.description),
    category: getStringArray(doc.categories)[0] ?? "Valuation",
    preferredProgrammes: getStringArray(doc.preferredProgrammes),
    acceptedYears: getStringArray(doc.eligibleYears),
    additionalRequirements: getString(doc.extraRequirements),
    poBox: getString(doc.poBox),
    address: getString(doc.address),
    city: getString(doc.address),
    region: getString(doc.address),
    whatsapp: getString(doc.whatsapp),
    email: getString(doc.contactEmail ?? doc.companyEmail),
    website: getString(doc.website),
    socials: {
      linkedin: socialsRaw ? getString(socialsRaw.linkedin) : undefined,
      instagram: socialsRaw ? getString(socialsRaw.instagram) : undefined,
      x: socialsRaw ? getString(socialsRaw.x) : undefined,
      facebook: socialsRaw ? getString(socialsRaw.facebook) : undefined,
    },
    applicationMethod: getString(doc.applicationMethod),
    availableSlots: Number(doc.availableSlots ?? 0),
    status: getString(doc.status),
    logoColor: "#0d9488",
  };
}

export function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { firebaseUser, role, profile } = useAuth();
  const { companies, savedCompanyIds, appliedCompanyIds, universities } = useData();

  const isUniversity = role === "university";
  const studentProfile = role === "student"
    ? (profile as StudentProfileData | null)
    : null;

  const [tab, setTab] = useState<Tab>("details");
  const [copied, setCopied] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [statsData, setStatsData] = useState<CompanyStatsData | null>(null);

  const companyDoc = companies.find((c) => c.id === id) as
    | Record<string, unknown>
    | undefined;

  // Fetch company stats in real time
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(
      doc(db, "companyStats", id),
      (snap) => {
        if (snap.exists()) {
          setStatsData(snap.data() as CompanyStatsData);
        } else {
          setStatsData(null);
        }
      },
      () => {
        setStatsData(null);
      }
    );
    return unsub;
  }, [id]);

  // Increment view count once when page loads
  useEffect(() => {
    if (!id) return;
    incrementCompanyStat(id, "totalViews").catch(() => {
      // Silent fail — non-critical if stats update is denied
    });
  }, [id]);

  const company: CompanyView | null = companyDoc
    ? normalizeCompany(companyDoc)
    : null;

  const saved = Boolean(company && savedCompanyIds.includes(company.id));
  const hasApplied = Boolean(company && appliedCompanyIds.includes(company.id));

  const yearMatches = useMemo(() => {
    if (!company || !studentProfile) return false;
    const studentYear = getString(studentProfile.yearOfStudy);
    return company.acceptedYears.includes(studentYear);
  }, [company, studentProfile]);

  const studentUniversity = useMemo(() => {
    if (!studentProfile?.university) return undefined;
    const target = getString(studentProfile.university).toLowerCase();
    return universities.find((u) => {
      const data = u as Record<string, unknown>;
      const name = getString(data.universityName ?? data.name).toLowerCase();
      const acronym = getString(data.acronym).toLowerCase();
      return name === target || acronym === target;
    });
  }, [universities, studentProfile]);

  const coordinatorWhatsApp = studentUniversity
    ? getString((studentUniversity as Record<string, unknown>).coordinatorWhatsapp).replace(/\D/g, "")
    : "";

  const contactMessage = encodeURIComponent(
    `Hello, I am a student of ${studentProfile?.university ?? "my university"} and I need guidance regarding a field placement.`,
  );

  if (!company) {
    return (
      <StudentLayout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Company not found
          </h1>
          <button
            onClick={() => navigate("/explore")}
            className="text-teal-600 font-medium hover:underline"
          >
            Back to Explore
          </button>
        </div>
      </StudentLayout>
    );
  }

  const Layout = isUniversity ? UniversityBrowseLayout : StudentLayout;

  function copyPoBox() {
    navigator.clipboard?.writeText(company?.poBox ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function toggleSave() {
    if (!firebaseUser || !company) return;
    const studentId = firebaseUser.uid;
    const docRef = doc(db, "savedCompanies", `${studentId}_${company.id}`);

    try {
      if (saved) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          studentId,
          companyId: company.id,
          createdAt: serverTimestamp(),
        });
      }
    } catch {
      // Show error if needed
    }
  }

  async function handleApply() {
    if (!firebaseUser || !company || hasApplied) return;
    const studentId = firebaseUser.uid;
    const docRef = doc(db, "applications", `${studentId}_${company.id}`);

    try {
      await setDoc(docRef, {
        studentId,
        companyId: company.id,
        appliedAt: serverTimestamp(),
      });
    } catch {
      // Error handled by UI
    }
  }

  async function reportCompany() {
    if (!firebaseUser || !company) return;

    const reason = window.prompt("Why are you reporting this company?");
    if (!reason || !reason.trim()) return;

    try {
      await addDoc(collection(db, "reports"), {
        reporterId: firebaseUser.uid,
        companyId: company.id,
        reason: reason.trim(),
        details: "",
        status: "open",
        createdAt: serverTimestamp(),
      });
      alert("Report submitted. Our admin team will review it.");
    } catch {
      alert("Failed to submit report. Please try again.");
    }
  }

  const whatsappNumber = company.whatsapp.replace(/[^\d]/g, "");
  const socials = company.socials ?? {};

  const totalViews = Number(statsData?.totalViews ?? 0);
  const totalSaves = Number(statsData?.totalSaves ?? 0);
  const totalApplied = Number(statsData?.totalApplied ?? 0);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28 sm:pb-12 relative">
        {/* Report flag — top right (students only) */}
        {!isUniversity && (
          <button
            onClick={reportCompany}
            className="absolute top-6 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Report company"
          >
            <Flag className="w-5 h-5" />
          </button>
        )}

        {/* ===== Profile header ===== */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {/* Logo */}
          <div className="flex justify-center sm:justify-start shrink-0">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white shadow-sm"
              />
            ) : (
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-sm"
                style={{ backgroundColor: company.logoColor }}
              >
                {company.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="flex justify-around sm:justify-start sm:gap-10 flex-1">
            <StatItem value={totalViews} label="Views" />
            <StatItem value={totalSaves} label="Saved by" />
            <StatItem value={totalApplied} label="Applied" />
          </div>
        </div>

        {/* Name + verified */}
        <div className="mt-4 flex items-center gap-1.5">
          <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
          {company.verified && (
            <BadgeCheck className="w-5 h-5 text-teal-600 fill-teal-50 shrink-0" />
          )}
        </div>

        {/* Tagline */}
        <p className="mt-1 text-sm text-gray-500">{company.tagline}</p>

        {/* Bio */}
        <p className="mt-3 text-sm text-gray-700 leading-relaxed">
          {company.description}
        </p>

        {/* Category tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            {company.category}
          </span>
          {company.preferredProgrammes.slice(0, 2).map((p) => (
            <span
              key={p}
              className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
            >
              {p}
            </span>
          ))}
        </div>

        {/* ===== Action buttons row ===== */}
        <div className={`mt-5 grid ${isUniversity ? "grid-cols-3" : "grid-cols-4"} gap-2`}>
          {!isUniversity && (
            <button
              onClick={toggleSave}
              className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                saved
                  ? "bg-teal-600 text-white hover:bg-teal-700"
                  : "border border-teal-600 text-teal-600 hover:bg-teal-50"
              }`}
            >
              {saved ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              <span className="hidden xs:inline sm:inline">Save</span>
            </button>
          )}

          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-sm font-medium border border-teal-600 text-teal-600 hover:bg-teal-50 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">WhatsApp</span>
          </a>

          <a
            href={`mailto:${company.email}`}
            className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-sm font-medium border border-teal-600 text-teal-600 hover:bg-teal-50 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Email</span>
          </a>

          {company.website ? (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-sm font-medium border border-teal-600 text-teal-600 hover:bg-teal-50 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Website</span>
            </a>
          ) : (
            <span className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-300 cursor-not-allowed">
              <Globe className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Website</span>
            </span>
          )}
        </div>

        {/* ===== Tabs ===== */}
        <div className="mt-6 border-b border-gray-200 flex">
          <TabButton
            active={tab === "details"}
            onClick={() => setTab("details")}
            label="Details"
          />
          <TabButton
            active={tab === "location"}
            onClick={() => setTab("location")}
            label="Location"
          />
        </div>

        {/* ===== Tab content ===== */}
        {tab === "details" && (
          <div className="mt-5 space-y-5">
            {/* Requirements box */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Field placement requirements
              </h2>

              {/* Year mismatch notice */}
              {!yearMatches && studentProfile && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    This company accepts {company.acceptedYears.join(", ")}. You
                    are in {getString(studentProfile.yearOfStudy)}.
                  </span>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  Years accepted
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {company.acceptedYears.map((y) => (
                    <span
                      key={y}
                      className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700"
                    >
                      {y}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  Preferred programmes
                </p>
                <ul className="space-y-1">
                  {company.preferredProgrammes.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {company.additionalRequirements && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                    Additional notes
                  </p>
                  <p className="text-sm text-gray-700">
                    {company.additionalRequirements}
                  </p>
                </div>
              )}

              {/* Application method preference */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  Application method
                </p>
                <p className="text-sm text-gray-700">
                  {company.applicationMethod === "office_visit"
                    ? "Drop off a hard-copy application letter at our office"
                    : "Email or WhatsApp a scanned copy of your application letter"}
                </p>
              </div>

              {/* Available positions */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  Positions available
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {company.availableSlots > 0
                    ? `${company.availableSlots} position${
                        company.availableSlots === 1 ? "" : "s"
                      } left`
                    : "No positions currently available"}
                </p>
              </div>
            </div>

            {/* PO Box */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Postal address
                </p>
                <p className="text-sm text-gray-800 mt-0.5">
                  {company.poBox}
                </p>
              </div>
              <button
                onClick={copyPoBox}
                className="flex items-center gap-1.5 text-sm text-teal-600 font-medium hover:text-teal-700 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </button>
            </div>

            {/* Social icons */}
            {(socials.linkedin ||
              socials.x ||
              socials.instagram ||
              socials.facebook) && (
              <div className="flex items-center gap-3">
                {socials.linkedin && (
                  <SocialIcon href={socials.linkedin} Icon={Linkedin} />
                )}
                {socials.x && <SocialIcon href={socials.x} Icon={Twitter} />}
                {socials.instagram && (
                  <SocialIcon href={socials.instagram} Icon={Instagram} />
                )}
                {socials.facebook && (
                  <SocialIcon href={socials.facebook} Icon={Facebook} />
                )}
              </div>
            )}

            {/* Sample application letter (students only) */}
            {!isUniversity && (
              <button
                onClick={() => setShowLetter(true)}
                className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                View sample application letter
              </button>
            )}
          </div>
        )}

        {tab === "location" && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {company.address}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {company.city}, {company.region}
                  </p>
                </div>
              </div>
            </div>

            {/* Mini map placeholder */}
            <div className="rounded-xl overflow-hidden border border-gray-200 h-48 bg-gray-100 relative">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 50%, #ecfdf5 100%)",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center shadow-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-600 bg-white/80 px-2 py-0.5 rounded">
                      {company.city}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== Sticky "I Applied Here" bar (mobile, students only) ===== */}
      {!isUniversity && (
        <div className="fixed bottom-16 left-0 right-0 z-30 sm:hidden">
          <div className="mx-3 mb-1">
            <button
              onClick={hasApplied ? undefined : handleApply}
              disabled={hasApplied}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg transition-colors ${
                hasApplied
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-teal-600 text-white hover:bg-teal-700"
              }`}
            >
              {hasApplied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Application submitted
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  I Applied Here
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ===== "Contact my university" button (students only) ===== */}
      {studentProfile && (
        <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden">
          <div className="mx-3 mb-3">
            {coordinatorWhatsApp ? (
              <a
                href={`https://wa.me/${coordinatorWhatsApp}?text=${contactMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-white border border-teal-600 text-teal-700 hover:bg-teal-50 transition-colors shadow-lg"
              >
                <GraduationCap className="w-4 h-4" />
                Contact my university for more
              </a>
            ) : (
              <div>
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed shadow-sm"
                >
                  <GraduationCap className="w-4 h-4" />
                  Contact my university for more
                </button>
                <p className="text-center text-xs text-gray-400 mt-1">
                  Your university hasn't provided a coordinator contact yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== Sample letter modal ===== */}
      {showLetter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowLetter(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Sample application letter</h3>
              <button
                onClick={() => setShowLetter(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="font-serif text-sm text-gray-700 leading-relaxed space-y-3">
                <p>
                  The Human Resources Manager
                  <br />
                  {company.name}
                  <br />
                  {company.poBox}
                </p>
                <p>Dear Sir/Madam,</p>
                <p>
                  I am writing to express my interest in the field placement
                  opportunity at {company.name}. I am a{" "}
                  {getString(studentProfile?.yearOfStudy) || "Year 3"} student pursuing{" "}
                  {getString(studentProfile?.programme) || "Land Management and Valuation"}{" "}
                  at {getString(studentProfile?.university) || "Ardhi University"}.
                </p>
                <p>
                  I am particularly drawn to {company.name} because of{" "}
                  {company.tagline.toLowerCase()}. I believe the practical
                  exposure would strengthen my understanding and contribute to
                  my academic growth.
                </p>
                <p>
                  I have attached my application letter, curriculum vitae and
                  student ID as required. I am available for the placement period
                  and am eager to contribute while learning.
                </p>
                <p>Thank you for your consideration.</p>
                <p>
                  Sincerely,
                  <br />
                  {getString(studentProfile?.fullName) || "Amina Hassan"}
                  <br />
                  {getString(studentProfile?.registrationNumber) || "2022-04-01234"}
                  <br />
                  {getString(studentProfile?.phone) || "+255 762 110 458"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-bold text-gray-900">{value}</span>
      <span className="text-xs text-gray-500 mt-0.5">{label}</span>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-medium transition-colors ${
        active
          ? "text-gray-900 font-semibold border-b-2 border-teal-600"
          : "text-gray-400 hover:text-gray-600 border-b-2 border-transparent"
      }`}
    >
      {label}
    </button>
  );
}

function SocialIcon({
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
      className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-teal-50 hover:text-teal-600 transition-colors"
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}