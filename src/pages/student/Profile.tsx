import { useEffect, useRef, useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Camera,
  X,
  Plus,
  Phone,
  Globe,
  Link2,
  Pencil,
  Check,
  LogOut,
  Briefcase,
  Image as ImageIcon,
} from "lucide-react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const GRAD_YEARS = ["2026", "2027", "2028", "2029", "2030"];

type StudentProfileData = {
  fullName?: string;
  university?: string;
  course?: string;
  yearOfStudy?: string;
  bio?: string;
  skills?: string[];
  languages?: string[];
  phone?: string;
  portfolioUrl?: string;
  expectedGraduationYear?: string;
  photoUrl?: string | null;
  featuredPhotoUrls?: string[];
};

type ApplicationItem = {
  id: string;
  companyId: string;
  appliedAt: string;
};

export function StudentProfile() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { firebaseUser, loading: authLoading } = useAuth();
  const { companies } = useData();

  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutDraft, setAboutDraft] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  useEffect(() => {
    if (!firebaseUser) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    const unsub = onSnapshot(
      doc(db, "students", firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as StudentProfileData);
        } else {
          setProfile(null);
        }
        setLoadingProfile(false);
      },
      (error) => {
        console.error("Profile load error:", error);
        setLoadingProfile(false);
      }
    );

    return unsub;
  }, [firebaseUser]);

  useEffect(() => {
    if (!firebaseUser) return;

    const q = query(
      collection(db, "applications"),
      where("studentId", "==", firebaseUser.uid),
      orderBy("appliedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const apps = snap.docs.map((d) => ({
        id: d.id,
        companyId: d.data().companyId as string,
        appliedAt:
          d.data().appliedAt?.toDate?.()?.toLocaleDateString() ?? "Unknown date",
      }));
      setApplications(apps);
    });

    return unsub;
  }, [firebaseUser]);

  if (authLoading || loadingProfile) {
    return (
      <StudentLayout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <p className="text-gray-500">Loading profile…</p>
        </div>
      </StudentLayout>
    );
  }

  if (!firebaseUser) {
    return (
      <StudentLayout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <p className="text-gray-500 mb-4">No user session found.</p>
          <button
            onClick={() => navigate("/student/login")}
            className="text-teal-600 font-medium hover:underline"
          >
            Go to login
          </button>
        </div>
      </StudentLayout>
    );
  }

  if (!profile) {
    return (
      <StudentLayout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <p className="text-gray-500 mb-4">No profile found.</p>
          <button
            onClick={() => navigate("/student/onboarding")}
            className="text-teal-600 font-medium hover:underline"
          >
            Complete onboarding
          </button>
        </div>
      </StudentLayout>
    );
  }

  const initials = (profile.fullName || "Student")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const skills = profile.skills ?? [];
  const languages = profile.languages ?? [];
  const photos = profile.featuredPhotoUrls ?? [];

  async function updateProfile(updates: Partial<StudentProfileData>) {
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, "students", firebaseUser.uid), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      showToast("Profile updated", "success");
    } catch {
      showToast("Failed to update profile", "error");
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile((prev) => (prev ? { ...prev, photoUrl: url } : prev));
      showToast("Photo preview updated (not saved yet)", "info");
    }
    e.target.value = "";
  }

  function handleGalleryAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      const urls = files.map((f) => URL.createObjectURL(f));
      const next = [...photos, ...urls].slice(0, 4);
      setProfile((prev) => (prev ? { ...prev, featuredPhotoUrls: next } : prev));
      showToast("Photo added (not saved yet)", "info");
    }
    e.target.value = "";
  }

  function addSkill() {
    const v = skillInput.trim();
    if (!v) return;
    if (skills.includes(v)) {
      showToast("Skill already added", "info");
      return;
    }
    updateProfile({ skills: [...skills, v] });
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    updateProfile({ skills: skills.filter((x) => x !== skill) });
  }

  function addLanguage() {
    const v = languageInput.trim();
    if (!v) return;
    if (languages.includes(v)) {
      showToast("Language already added", "info");
      return;
    }
    updateProfile({ languages: [...languages, v] });
    setLanguageInput("");
  }

  function removeLanguage(lang: string) {
    updateProfile({ languages: languages.filter((x) => x !== lang) });
  }

  function removePhoto(idx: number) {
    const next = photos.filter((_, i) => i !== idx);
    setProfile((prev) => (prev ? { ...prev, featuredPhotoUrls: next } : prev));
  }

  function saveAbout() {
    updateProfile({ bio: aboutDraft.trim() });
    setEditingAbout(false);
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/");
    } catch {
      showToast("Logout failed", "error");
    }
  }

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 pb-28 sm:pb-12 space-y-5">
        <div className="flex justify-end">
          <button
            onClick={() => navigate("/explore")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-teal-600 text-teal-700 bg-white hover:bg-teal-50 transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            Browse Companies
          </button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <button
              onClick={() => photoInputRef.current?.click()}
              className="relative group shrink-0"
              aria-label="Change profile photo"
            >
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName ?? "Profile"}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-teal-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white shadow-sm">
                  {initials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center ring-2 ring-white shadow-sm group-hover:scale-110 transition-transform">
                <Camera className="w-4 h-4 text-white" />
              </span>
            </button>
            <button
              onClick={() => photoInputRef.current?.click()}
              className="text-xs text-teal-600 font-medium hover:underline"
            >
              Change photo
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-gray-900">
              {profile.fullName || "Student"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{profile.university || "—"}</p>
            <p className="text-sm text-gray-400 mt-0.5">
              {profile.course || "—"} · {profile.yearOfStudy || "—"}
            </p>
            {profile.portfolioUrl && (
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm text-teal-600 font-medium hover:underline"
              >
                <Link2 className="w-3.5 h-3.5" />
                {profile.portfolioUrl.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        {/* Education + Skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-teal-600" />
              Education
            </h2>
            <div className="space-y-3">
              <EducationRow
                Icon={GraduationCap}
                label="University"
                value={profile.university || "—"}
              />
              <EducationRow
                Icon={BookOpen}
                label="Course"
                value={profile.course || "—"}
              />
              <EducationRow
                Icon={Calendar}
                label="Year of study"
                value={profile.yearOfStudy || "—"}
              />
              <div className="flex items-center justify-between gap-3 pt-1">
                <EducationRow
                  Icon={Calendar}
                  label="Expected graduation"
                  value={profile.expectedGraduationYear || "—"}
                />
                <select
                  value={profile.expectedGraduationYear ?? ""}
                  onChange={(e) =>
                    updateProfile({ expectedGraduationYear: e.target.value || undefined })
                  }
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Set year</option>
                  {GRAD_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              Skills
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.length === 0 && (
                <p className="text-sm text-gray-400">No skills added yet.</p>
              )}
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="hover:text-teal-900"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a skill"
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                onClick={addSkill}
                className="px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">About</h2>
            {!editingAbout ? (
              <button
                onClick={() => {
                  setAboutDraft(profile.bio ?? "");
                  setEditingAbout(true);
                }}
                className="text-xs text-teal-600 font-medium hover:underline flex items-center gap-1"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingAbout(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAbout}
                  className="text-xs text-teal-600 font-medium hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Save
                </button>
              </div>
            )}
          </div>

          {editingAbout ? (
            <textarea
              value={aboutDraft}
              onChange={(e) => setAboutDraft(e.target.value)}
              rows={4}
              autoFocus
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              placeholder="Write a short bio about yourself..."
            />
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed">
              {profile.bio || "No about text yet. Click edit to add one."}
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="tel"
                value={profile.phone ?? ""}
                onChange={(e) => updateProfile({ phone: e.target.value })}
                placeholder="Phone number"
                className="flex-1 text-sm border-b border-transparent focus:border-teal-500 px-1 py-1 text-gray-700 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="url"
                value={profile.portfolioUrl ?? ""}
                onChange={(e) =>
                  updateProfile({ portfolioUrl: e.target.value || undefined })
                }
                placeholder="Portfolio or LinkedIn URL"
                className="flex-1 text-sm border-b border-transparent focus:border-teal-500 px-1 py-1 text-gray-700 focus:outline-none"
              />
            </div>

            {/* Languages */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Languages
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {languages.length === 0 && (
                  <p className="text-sm text-gray-400">No languages added.</p>
                )}
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                  >
                    {lang}
                    <button
                      onClick={() => removeLanguage(lang)}
                      className="hover:text-gray-900"
                      aria-label={`Remove ${lang}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLanguage();
                    }
                  }}
                  placeholder="Add a language"
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  onClick={addLanguage}
                  className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-teal-600" />
            Featured photos
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {photos.map((url, idx) => (
              <div
                key={idx}
                className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group"
              >
                <img
                  src={url}
                  alt={`Featured ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {photos.length < 4 && (
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-teal-400 hover:text-teal-500 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-medium">Add a photo</span>
              </button>
            )}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryAdd}
            />
          </div>
        </div>

        {/* Companies applied to */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-teal-600" />
            Companies I Applied To
          </h2>
          {applications.length === 0 ? (
            <p className="text-sm text-gray-400">
              You haven't applied to any companies yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {applications.map((app) => {
                const company = companies.find((c) => c.id === app.companyId);
                if (!company) return null;

                const companyName = String(company.companyName ?? company.name ?? "");
                const companyLogoUrl =
                  typeof company.logoUrl === "string" ? company.logoUrl : null;
                const initial = companyName ? companyName.charAt(0).toUpperCase() : "C";

                return (
                  <li key={app.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 bg-teal-600">
                        {companyLogoUrl ? (
                          <img
                            src={companyLogoUrl}
                            alt=""
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          initial
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {companyName}
                        </p>
                        <p className="text-xs text-gray-400">
                          Applied {app.appliedAt}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Logout */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-600 border border-red-200 bg-white hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>
    </StudentLayout>
  );
}

function EducationRow({
  Icon,
  label,
  value,
}: {
  Icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}