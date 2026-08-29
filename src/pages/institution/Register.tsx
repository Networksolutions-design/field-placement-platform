import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useApp } from "@/context/AppContext";
import { createUserWithEmailAndPassword, sendEmailVerification, reload } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Category, YearOfStudy } from "@/types";
import {
  ArrowLeft,
  Check,
  Mail,
  CheckCircle2,
  Building2,
  GraduationCap,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

const ALL_CATEGORIES: Category[] = [
  "Valuation",
  "Land Surveying",
  "GIS & Mapping",
  "Real Estate",
  "Construction",
  "Accounting",
  "IT",
  "Engineering",
];

const ALL_YEARS: YearOfStudy[] = [
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Postgraduate",
];

const PROGRAMME_OPTIONS = [
  "Land Management",
  "Land Surveying",
  "Valuation",
  "Architecture",
  "Civil Engineering",
  "Computer Science",
  "Information Technology",
  "Accounting",
  "Finance",
  "Business Administration",
  "Environmental Science",
  "Geography",
];

function getFirebaseErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code === "auth/email-already-in-use") return "This email is already registered.";
  if (code === "auth/invalid-email") return "Invalid email address.";
  if (code === "auth/weak-password") return "Password is too weak.";
  return "Failed to create account. Please try again.";
}

type Tab = "company" | "university";

interface CompanyForm {
  email: string;
  password: string;
  fullName: string;
  authorized: boolean;
  tagline: string;
  categories: Category[];
  description: string;
  address: string;
  poBox: string;
  phone: string;
  whatsapp: string;
  contactEmail: string;
  website: string;
  city: string;
  region: string;
  acceptedYears: YearOfStudy[];
  preferredProgrammes: string[];
  additionalRequirements: string;
  applicationMethod: "office_visit" | "email_whatsapp";
  availableSlots: number;
  logoUrl: string;
  coverUrl: string;
  linkedin: string;
  instagram: string;
  twitter: string;
  facebook: string;
}

interface UniversityForm {
  email: string;
  password: string;
  fullName: string;
  acronym: string;
  tcuRegistrationNumber: string;
  universityType: "Public" | "Private";
  establishedYear: string;
  address: string;
  poBox: string;
  phone: string;
  website: string;
  logoUrl: string;
  coordinatorWhatsApp: string;
  accredited: boolean;
  agreedTerms: boolean;
}

const initialCompanyForm: CompanyForm = {
  email: "",
  password: "",
  fullName: "",
  authorized: false,
  tagline: "",
  categories: [],
  description: "",
  address: "",
  poBox: "",
  phone: "",
  whatsapp: "",
  contactEmail: "",
  website: "",
  city: "",
  region: "",
  acceptedYears: [],
  preferredProgrammes: [],
  additionalRequirements: "",
  applicationMethod: "office_visit",
  availableSlots: 0,
  logoUrl: "",
  coverUrl: "",
  linkedin: "",
  instagram: "",
  twitter: "",
  facebook: "",
};

const initialUniversityForm: UniversityForm = {
  email: "",
  password: "",
  fullName: "",
  acronym: "",
  tcuRegistrationNumber: "",
  universityType: "Public",
  establishedYear: "",
  address: "",
  poBox: "",
  phone: "",
  website: "",
  logoUrl: "",
  coordinatorWhatsApp: "",
  accredited: false,
  agreedTerms: false,
};

export function InstitutionRegister() {
  const navigate = useNavigate();
  const {
    showToast,
    currentUniversity,
    updateUniversityProfile,
    currentCompany,
    updateCompanyProfile,
  } = useApp();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(
    searchParams.get("tab") === "university" ? "university" : "company",
  );
  const isEditing = Boolean(currentUniversity);
  const isCompanyEditing = searchParams.get("edit") === "company";
  const [companyForm, setCompanyForm] = useState<CompanyForm>(initialCompanyForm);
  const [universityForm, setUniversityForm] =
    useState<UniversityForm>(initialUniversityForm);
  const [stage, setStage] = useState<"form" | "loading" | "verify">("form");
  const [showCompanyPasswordChecks, setShowCompanyPasswordChecks] = useState(false);

  useEffect(() => {
    if (isCompanyEditing && currentCompany) {
      setCompanyForm({
        email: currentCompany.contactInfo.email,
        password: "",
        fullName: currentCompany.name,
        authorized: true,
        tagline: currentCompany.tagline,
        categories: [currentCompany.category],
        description: currentCompany.description,
        address: currentCompany.location.address,
        poBox: currentCompany.contactInfo.poBox,
        phone: currentCompany.contactInfo.phone,
        whatsapp: currentCompany.contactInfo.whatsapp,
        contactEmail: currentCompany.contactInfo.email,
        website: currentCompany.contactInfo.website ?? "",
        city: currentCompany.location.city,
        region: currentCompany.location.region,
        acceptedYears: currentCompany.acceptedYears,
        preferredProgrammes: currentCompany.preferredProgrammes,
        additionalRequirements: currentCompany.additionalRequirements,
        applicationMethod: "office_visit",
        availableSlots: 0,
        logoUrl: currentCompany.logoUrl,
        coverUrl: currentCompany.coverUrl,
        linkedin: currentCompany.socialLinks?.linkedin ?? "",
        instagram: currentCompany.socialLinks?.instagram ?? "",
        twitter: currentCompany.socialLinks?.twitter ?? "",
        facebook: currentCompany.socialLinks?.facebook ?? "",
      });
    }
  }, [isCompanyEditing, currentCompany]);

  useEffect(() => {
    if (currentUniversity) {
      setUniversityForm({
        email: currentUniversity.email,
        password: currentUniversity.password,
        fullName: currentUniversity.name,
        acronym: currentUniversity.acronym,
        tcuRegistrationNumber: currentUniversity.tcuRegistrationNumber,
        universityType: currentUniversity.universityType,
        establishedYear: String(currentUniversity.establishedYear),
        address: currentUniversity.address,
        poBox: currentUniversity.poBox,
        phone: currentUniversity.phone,
        website: currentUniversity.website,
        logoUrl: currentUniversity.logoUrl,
        coordinatorWhatsApp: currentUniversity.coordinatorWhatsApp ?? "",
        accredited: true,
        agreedTerms: true,
      });
    }
  }, [currentUniversity]);

  const companyPasswordChecks = {
    length: companyForm.password.length >= 6,
    lower: /[a-z]/.test(companyForm.password),
    upper: /[A-Z]/.test(companyForm.password),
    number: /\d/.test(companyForm.password),
    symbol: /[^a-zA-Z0-9]/.test(companyForm.password),
  };

  const companyPasswordValid = Object.values(companyPasswordChecks).every(Boolean);

  function toggleArrayItem<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  }

  function formatWhatsApp(value: string): string {
    let digits = value.replace(/[^0-9]/g, "");
    if (digits.startsWith("255")) {
      // keep as is
    } else if (digits.startsWith("0")) {
      digits = "255" + digits.slice(1);
    }
    if (digits.length <= 3) return "+" + digits;
    if (digits.length <= 6) return `+${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 9)
      return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
  }

  function scrollToFirstError(firstError: string) {
    const fieldMap: Record<string, string> = {
      "Company Email": "companyEmail",
      Password: "companyPassword",
      "Company Full Name": "companyFullName",
      "Authorization confirmation": "authorized",
      Tagline: "tagline",
      Category: "categories",
      "Physical Address": "address",
      "Office Phone": "phone",
      "Contact Email": "contactEmail",
      "Placement Preferences": "acceptedYears",
      "Positions available": "availableSlots",
      "At least one social media link": "socials",
    };

    const target = fieldMap[firstError];

    if (target === "socials") {
      const socialSection = document.getElementById("social-links");
      socialSection?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (target) {
      const el = document.getElementsByName(target)?.[0];
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      (el as HTMLElement)?.focus?.();
    }
  }

  function validateCompanyForm(): string[] {
    const missing: string[] = [];
    if (!companyForm.email.trim()) missing.push("Company Email");
    if (!companyForm.password) {
      missing.push("Password");
    } else if (!companyPasswordValid) {
      missing.push("Password does not meet requirements");
    }
    if (!companyForm.fullName.trim()) missing.push("Company Full Name");
    if (!companyForm.authorized) missing.push("Authorization confirmation");
    if (!companyForm.tagline.trim()) missing.push("Tagline");
    if (companyForm.categories.length === 0) missing.push("Category");
    if (!companyForm.address.trim()) missing.push("Physical Address");
    if (!companyForm.phone.trim()) missing.push("Office Phone");
    if (!companyForm.contactEmail.trim()) missing.push("Contact Email");
    if (companyForm.acceptedYears.length === 0) missing.push("Placement Preferences");
    if (!companyForm.availableSlots || companyForm.availableSlots < 1) {
      missing.push("Positions available");
    }

    const socialsFilled = [
      companyForm.linkedin,
      companyForm.instagram,
      companyForm.twitter,
      companyForm.facebook,
    ].some((v) => v.trim().length > 0);

    if (!socialsFilled) {
      missing.push("At least one social media link");
    }

    return missing;
  }

  function validateUniversityForm(): string[] {
    const missing: string[] = [];
    if (!universityForm.email.trim()) missing.push("University Email");
    if (!universityForm.password) missing.push("Password");
    if (!universityForm.fullName.trim()) missing.push("University Full Name");
    if (!universityForm.acronym.trim()) missing.push("Acronym");
    if (!universityForm.tcuRegistrationNumber.trim())
      missing.push("TCU Registration Number");
    if (!universityForm.establishedYear) missing.push("Year of Establishment");
    if (!universityForm.address.trim()) missing.push("Physical Address");
    if (!universityForm.poBox.trim()) missing.push("P.O. Box");
    if (!universityForm.phone.trim()) missing.push("Official University Phone");
    if (!universityForm.website.trim()) missing.push("Official University Website");
    if (!universityForm.accredited)
      missing.push("TCU Accreditation confirmation");
    if (!universityForm.agreedTerms) missing.push("Terms & Privacy Policy");
    return missing;
  }

  async function handleCompanySubmit() {
    const missing = validateCompanyForm();
    if (missing.length > 0) {
      showToast(`Missing: ${missing.join(", ")}`, "error");
      scrollToFirstError(missing[0]);
      return;
    }

    if (isCompanyEditing && currentCompany) {
      updateCompanyProfile({
        name: companyForm.fullName,
        tagline: companyForm.tagline,
        category: companyForm.categories[0],
        description: companyForm.description,
        location: {
          address: companyForm.address,
          city: companyForm.city,
          region: companyForm.region,
        },
        acceptedYears: companyForm.acceptedYears,
        preferredProgrammes: companyForm.preferredProgrammes,
        contactInfo: {
          email: companyForm.contactEmail,
          phone: companyForm.phone,
          whatsapp: companyForm.whatsapp,
          website: companyForm.website || undefined,
          poBox: companyForm.poBox,
          contactPerson: companyForm.fullName,
        },
        socialLinks: {
          linkedin: companyForm.linkedin || undefined,
          instagram: companyForm.instagram || undefined,
          twitter: companyForm.twitter || undefined,
          facebook: companyForm.facebook || undefined,
        },
        logoUrl: companyForm.logoUrl,
        coverUrl: companyForm.coverUrl,
        additionalRequirements: companyForm.additionalRequirements,
      });
      showToast("Profile updated", "success");
      navigate("/company/dashboard");
      return;
    }

    setStage("loading");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        companyForm.email,
        companyForm.password,
      );

      await sendEmailVerification(userCredential.user);

      await setDoc(doc(db, "companies", userCredential.user.uid), {
        uid: userCredential.user.uid,
        companyEmail: companyForm.email,
        contactEmail: companyForm.contactEmail || null,
        companyName: companyForm.fullName,
        tagline: companyForm.tagline,
        categories: companyForm.categories,
        description: companyForm.description || null,
        address: companyForm.address,
        poBox: companyForm.poBox,
        phone: companyForm.phone,
        whatsapp: companyForm.whatsapp,
        website: companyForm.website || null,
        socials: {
          linkedin: companyForm.linkedin || null,
          instagram: companyForm.instagram || null,
          x: companyForm.twitter || null,
          facebook: companyForm.facebook || null,
        },
        coordinates: null,
        eligibleYears: companyForm.acceptedYears,
        preferredProgrammes: companyForm.preferredProgrammes,
        extraRequirements: companyForm.additionalRequirements || null,
        applicationMethod: companyForm.applicationMethod,
        availableSlots: companyForm.availableSlots,
        logoUrl: companyForm.logoUrl || null,
        coverUrl: companyForm.coverUrl || null,
        status: "pending",
        rejectionReason: null,
        authorisedRepConfirmed: companyForm.authorized,
        registeredByAdmin: false,
        adminViewed: false,
        emailVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        approvedAt: null,
      });

      showToast("Verification email sent", "success");
      setStage("verify");
    } catch (error) {
      showToast(getFirebaseErrorMessage(error), "error");
      setStage("form");
    }
  }

  async function handleUniversitySubmit() {
    const missing = validateUniversityForm();
    if (missing.length > 0) {
      showToast(`Missing: ${missing.join(", ")}`, "error");
      return;
    }

    if (isEditing && currentUniversity) {
      updateUniversityProfile({
        name: universityForm.fullName,
        acronym: universityForm.acronym,
        tcuRegistrationNumber: universityForm.tcuRegistrationNumber,
        universityType: universityForm.universityType,
        establishedYear: parseInt(universityForm.establishedYear) || 2000,
        address: universityForm.address,
        poBox: universityForm.poBox,
        phone: universityForm.phone,
        website: universityForm.website,
        logoUrl: universityForm.logoUrl,
        coordinatorWhatsApp: universityForm.coordinatorWhatsApp || undefined,
      });
      showToast("Profile updated", "success");
      navigate("/university/dashboard");
      return;
    }

    setStage("loading");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        universityForm.email,
        universityForm.password,
      );

      await sendEmailVerification(userCredential.user);

      await setDoc(doc(db, "universities", userCredential.user.uid), {
        uid: userCredential.user.uid,
        universityEmail: universityForm.email,
        universityName: universityForm.fullName,
        acronym: universityForm.acronym,
        tcuRegistrationNumber: universityForm.tcuRegistrationNumber,
        universityType: universityForm.universityType,
        yearEstablished: parseInt(universityForm.establishedYear) || 2000,
        address: universityForm.address,
        poBox: universityForm.poBox,
        phone: universityForm.phone,
        website: universityForm.website,
        coordinatorWhatsapp: universityForm.coordinatorWhatsApp || null,
        logoUrl: universityForm.logoUrl || null,
        status: "pending",
        rejectionReason: null,
        accreditationConfirmed: universityForm.accredited,
        adminViewed: false,
        emailVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        approvedAt: null,
      });

      showToast("Verification email sent", "success");
      setStage("verify");
    } catch (error) {
      showToast(getFirebaseErrorMessage(error), "error");
      setStage("form");
    }
  }

  async function handleCompanyVerify() {
    try {
      const user = auth.currentUser;
      if (!user) {
        showToast("No user session found. Please sign up again.", "error");
        return;
      }

      await reload(user);

      if (user.emailVerified) {
        showToast("Company profile submitted for approval", "success");
        navigate("/company/dashboard");
      } else {
        showToast("Please verify your email first.", "error");
      }
    } catch {
      showToast("Could not verify email status. Please try again.", "error");
    }
  }

  async function handleUniversityVerify() {
    try {
      const user = auth.currentUser;
      if (!user) {
        showToast("No user session found. Please sign up again.", "error");
        return;
      }

      await reload(user);

      if (user.emailVerified) {
        showToast("University profile submitted for approval", "success");
        navigate("/university/dashboard");
      } else {
        showToast("Please verify your email first.", "error");
      }
    } catch {
      showToast("Could not verify email status. Please try again.", "error");
    }
  }

  // Verification stage
  if (stage === "verify") {
    const email = tab === "company" ? companyForm.email : universityForm.email;
    const onVerify =
      tab === "company" ? handleCompanyVerify : handleUniversityVerify;
    return (
      <PublicLayout>
        <div className="max-w-md mx-auto px-4 py-16">
          <Card className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-7 h-7 text-teal-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Check your email
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              We sent a verification link to{" "}
              <span className="font-medium text-gray-900">{email}</span>. Click it
              to confirm, then continue.
            </p>
            <Button className="w-full" onClick={onVerify}>
              <CheckCircle2 className="w-4 h-4" /> I've verified — continue
            </Button>
            <button
              onClick={() => setStage("form")}
              className="mt-4 text-sm text-gray-500 hover:text-gray-800"
            >
              Use a different email
            </button>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  // Loading stage
  if (stage === "loading") {
    return (
      <PublicLayout>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <Spinner className="w-8 h-8 text-teal-600 mx-auto" />
          <p className="text-sm text-gray-500 mt-4">Creating account...</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Register your institution
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Create an account for your company or university.
        </p>

        {/* Tab switch */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
          <button
            onClick={() => setTab("company")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === "company"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Building2 className="w-4 h-4" /> Company
          </button>
          <button
            onClick={() => setTab("university")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === "university"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <GraduationCap className="w-4 h-4" /> University
          </button>
        </div>

        {tab === "company" ? (
          <div
            key="company"
            className="animate-[fadeIn_0.2s_ease-out]"
          >
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Company account
              </h2>
              <Input
                label="Company Email"
                name="companyEmail"
                type="email"
                placeholder="info@yourcompany.co.tz"
                value={companyForm.email}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, email: e.target.value })
                }
              />
              <div>
                <Input
                  label="Password"
                  name="companyPassword"
                  type="password"
                  placeholder="At least 6 characters"
                  value={companyForm.password}
                  onChange={(e) => {
                    setCompanyForm({ ...companyForm, password: e.target.value });
                    setShowCompanyPasswordChecks(true);
                  }}
                />
                {showCompanyPasswordChecks && (
                  <div className="mt-2 space-y-1.5">
                    <PasswordRequirement label="At least 6 characters" met={companyPasswordChecks.length} />
                    <PasswordRequirement label="One lowercase letter" met={companyPasswordChecks.lower} />
                    <PasswordRequirement label="One uppercase letter" met={companyPasswordChecks.upper} />
                    <PasswordRequirement label="One number" met={companyPasswordChecks.number} />
                    <PasswordRequirement label="One symbol (!@#$...)" met={companyPasswordChecks.symbol} />
                  </div>
                )}
              </div>
              <Input
                label="Company Full Name"
                name="companyFullName"
                placeholder="e.g. Ardhi Surveyors Ltd"
                value={companyForm.fullName}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, fullName: e.target.value })
                }
              />
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={companyForm.authorized}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      authorized: e.target.checked,
                    })
                  }
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-600">
                  I confirm that I am an authorized representative and agree to
                  the{" "}
                  <a
                    href="/terms"
                    className="text-teal-600 hover:underline"
                  >
                    Terms
                  </a>{" "}
                  &{" "}
                  <a
                    href="/privacy"
                    className="text-teal-600 hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              <hr className="border-gray-100" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tagline
                </label>
                <Input
                  name="tagline"
                  placeholder="A short, catchy one-liner about your company"
                  value={companyForm.tagline}
                  maxLength={80}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, tagline: e.target.value })
                  }
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-400">
                    {companyForm.tagline.length}/80
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map((cat) => {
                    const selected = companyForm.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          setCompanyForm({
                            ...companyForm,
                            categories: toggleArrayItem(
                              companyForm.categories,
                              cat,
                            ),
                          })
                        }
                        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                          selected
                            ? "bg-teal-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Textarea
                label="Description (optional)"
                name="description"
                placeholder="Describe what your company does and what students can expect"
                rows={4}
                value={companyForm.description}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, description: e.target.value })
                }
              />

              <hr className="border-gray-100" />

              <Input
                label="Physical Address"
                name="address"
                placeholder="e.g. 123 Mlimani Tower, Sam Nujoma Road"
                value={companyForm.address}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, address: e.target.value })
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="P.O. Box"
                  name="poBox"
                  placeholder="e.g. 12345 DSM"
                  value={companyForm.poBox}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, poBox: e.target.value })
                  }
                />
                <Input
                  label="City"
                  name="city"
                  placeholder="e.g. Dar es Salaam"
                  value={companyForm.city}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, city: e.target.value })
                  }
                />
              </div>
              <Input
                label="Region"
                name="region"
                placeholder="e.g. Dar es Salaam"
                value={companyForm.region}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, region: e.target.value })
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Office Phone"
                  name="phone"
                  placeholder="+255 22 123 4567"
                  value={companyForm.phone}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, phone: e.target.value })
                  }
                />
                <Input
                  label="WhatsApp Number"
                  name="whatsapp"
                  placeholder="+255 712 345 678"
                  value={companyForm.whatsapp}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      whatsapp: formatWhatsApp(e.target.value),
                    })
                  }
                />
              </div>
              <Input
                label="Contact Email"
                name="contactEmail"
                type="email"
                placeholder="info@company.co.tz"
                value={companyForm.contactEmail}
                onChange={(e) =>
                  setCompanyForm({
                    ...companyForm,
                    contactEmail: e.target.value,
                  })
                }
              />
              <Input
                label="Website URL"
                name="website"
                placeholder="https://company.co.tz"
                value={companyForm.website}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, website: e.target.value })
                }
              />

              <div id="social-links">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social media links (at least one required)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    name="linkedin"
                    placeholder="https://linkedin.com/company/..."
                    value={companyForm.linkedin}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, linkedin: e.target.value })
                    }
                  />
                  <Input
                    name="instagram"
                    placeholder="https://instagram.com/..."
                    value={companyForm.instagram}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, instagram: e.target.value })
                    }
                  />
                  <Input
                    name="twitter"
                    placeholder="https://twitter.com/... or https://x.com/..."
                    value={companyForm.twitter}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, twitter: e.target.value })
                    }
                  />
                  <Input
                    name="facebook"
                    placeholder="https://facebook.com/..."
                    value={companyForm.facebook}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, facebook: e.target.value })
                    }
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placement Preferences — Accepted years
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_YEARS.map((year) => {
                    const selected = companyForm.acceptedYears.includes(year);
                    return (
                      <label
                        key={year}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 cursor-pointer transition-all ${
                          selected
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            setCompanyForm({
                              ...companyForm,
                              acceptedYears: toggleArrayItem(
                                companyForm.acceptedYears,
                                year,
                              ),
                            })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">{year}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred programmes
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROGRAMME_OPTIONS.map((prog) => {
                    const selected = companyForm.preferredProgrammes.includes(prog);
                    return (
                      <button
                        key={prog}
                        type="button"
                        onClick={() =>
                          setCompanyForm({
                            ...companyForm,
                            preferredProgrammes: toggleArrayItem(
                              companyForm.preferredProgrammes,
                              prog,
                            ),
                          })
                        }
                        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                          selected
                            ? "bg-teal-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {prog}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Textarea
                label="Additional requirements (optional)"
                name="additionalRequirements"
                placeholder="e.g. Must have own laptop, must complete safety induction"
                rows={3}
                value={companyForm.additionalRequirements}
                onChange={(e) =>
                  setCompanyForm({
                    ...companyForm,
                    additionalRequirements: e.target.value,
                  })
                }
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  How should students apply?
                </label>
                <select
                  value={companyForm.applicationMethod}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      applicationMethod: e.target.value as
                        | "office_visit"
                        | "email_whatsapp",
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                >
                  <option value="office_visit">
                    Drop off a hard-copy letter at our office
                  </option>
                  <option value="email_whatsapp">
                    Email / WhatsApp a scanned copy
                  </option>
                </select>
              </div>

              <Input
                label="Positions available"
                name="availableSlots"
                type="number"
                min={0}
                placeholder="e.g. 5"
                value={companyForm.availableSlots}
                onChange={(e) =>
                  setCompanyForm({
                    ...companyForm,
                    availableSlots: Number(e.target.value),
                  })
                }
              />

              <hr className="border-gray-100" />

              {/* Logo upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
                    {companyForm.logoUrl ? (
                      <img
                        src={companyForm.logoUrl}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
                      <Upload className="w-4 h-4" /> Upload logo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () =>
                            setCompanyForm({
                              ...companyForm,
                              logoUrl: reader.result as string,
                            });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Cover upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover image (optional)
                </label>
                <div className="relative h-40 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden">
                  {companyForm.coverUrl ? (
                    <img
                      src={companyForm.coverUrl}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  ) : companyForm.logoUrl ? (
                    <img
                      src={companyForm.logoUrl}
                      alt="Logo as cover"
                      className="w-full h-full object-cover opacity-80"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="w-10 h-10 text-gray-300" />
                      <span className="text-sm text-gray-400">
                        Upload a cover image
                      </span>
                    </div>
                  )}
                </div>
                <label className="cursor-pointer mt-2 inline-block">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
                    <Upload className="w-4 h-4" /> Upload cover
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                          setCompanyForm({
                            ...companyForm,
                            coverUrl: reader.result as string,
                          });
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              <Button className="w-full" onClick={handleCompanySubmit}>
                <Check className="w-4 h-4" /> {isCompanyEditing ? "Save Changes" : "Submit for Review"}
              </Button>
            </Card>
          </div>
        ) : (
          <div
            key="university"
            className="animate-[fadeIn_0.2s_ease-out]"
          >
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                University account
              </h2>
              <Input
                label="University Email"
                name="uniEmail"
                type="email"
                placeholder="name@udsm.ac.tz"
                value={universityForm.email}
                onChange={(e) =>
                  setUniversityForm({ ...universityForm, email: e.target.value })
                }
              />
              <Input
                label="Password"
                name="uniPassword"
                type="password"
                placeholder="At least 6 characters"
                value={universityForm.password}
                onChange={(e) =>
                  setUniversityForm({
                    ...universityForm,
                    password: e.target.value,
                  })
                }
              />
              <Input
                label="University Full Name"
                name="uniFullName"
                placeholder="e.g. University of Dar es Salaam"
                value={universityForm.fullName}
                onChange={(e) =>
                  setUniversityForm({
                    ...universityForm,
                    fullName: e.target.value,
                  })
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Acronym"
                  name="acronym"
                  placeholder="e.g. UDSM, ARU, SUA"
                  value={universityForm.acronym}
                  onChange={(e) =>
                    setUniversityForm({
                      ...universityForm,
                      acronym: e.target.value,
                    })
                  }
                />
                <Input
                  label="TCU Registration Number"
                  name="tcuReg"
                  placeholder="e.g. TCU/UDSM/001"
                  value={universityForm.tcuRegistrationNumber}
                  onChange={(e) =>
                    setUniversityForm({
                      ...universityForm,
                      tcuRegistrationNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    University Type
                  </label>
                  <select
                    value={universityForm.universityType}
                    onChange={(e) =>
                      setUniversityForm({
                        ...universityForm,
                        universityType: e.target.value as "Public" | "Private",
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
                <Input
                  label="Year of Establishment"
                  name="establishedYear"
                  type="number"
                  placeholder="e.g. 1961"
                  value={universityForm.establishedYear}
                  onChange={(e) =>
                    setUniversityForm({
                      ...universityForm,
                      establishedYear: e.target.value,
                    })
                  }
                />
              </div>
              <Input
                label="Physical Address"
                name="uniAddress"
                placeholder="e.g. Mlimani Campus, University Road"
                value={universityForm.address}
                onChange={(e) =>
                  setUniversityForm({
                    ...universityForm,
                    address: e.target.value,
                  })
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="P.O. Box"
                  name="uniPoBox"
                  placeholder="e.g. P.O. Box 35091"
                  value={universityForm.poBox}
                  onChange={(e) =>
                    setUniversityForm({
                      ...universityForm,
                      poBox: e.target.value,
                    })
                  }
                />
                <Input
                  label="Official University Phone"
                  name="uniPhone"
                  placeholder="+255 22 241 0078"
                  value={universityForm.phone}
                  onChange={(e) =>
                    setUniversityForm({
                      ...universityForm,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <Input
                label="Official University Website"
                name="uniWebsite"
                placeholder="https://www.udsm.ac.tz"
                value={universityForm.website}
                onChange={(e) =>
                  setUniversityForm({
                    ...universityForm,
                    website: e.target.value,
                  })
                }
              />
              <Input
                label="Industrial Training Coordinator WhatsApp Number"
                name="uniCoordinatorWhatsApp"
                placeholder="e.g. 2557XXXXXXXX"
                value={universityForm.coordinatorWhatsApp}
                onChange={(e) =>
                  setUniversityForm({
                    ...universityForm,
                    coordinatorWhatsApp: formatWhatsApp(e.target.value),
                  })
                }
              />

              {/* Logo upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
                    {universityForm.logoUrl ? (
                      <img
                        src={universityForm.logoUrl}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
                      <Upload className="w-4 h-4" /> Upload logo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () =>
                            setUniversityForm({
                              ...universityForm,
                              logoUrl: reader.result as string,
                            });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <hr className="border-gray-100" />

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={universityForm.accredited}
                  onChange={(e) =>
                    setUniversityForm({
                      ...universityForm,
                      accredited: e.target.checked,
                    })
                  }
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-600">
                  I confirm that this institution is fully accredited by TCU and
                  I am an authorized representative.
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={universityForm.agreedTerms}
                  onChange={(e) =>
                    setUniversityForm({
                      ...universityForm,
                      agreedTerms: e.target.checked,
                    })
                  }
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="/terms" className="text-teal-600 hover:underline">
                    Terms
                  </a>{" "}
                  &{" "}
                  <a href="/privacy" className="text-teal-600 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              <Button className="w-full" onClick={handleUniversitySubmit}>
                <Check className="w-4 h-4" /> {isEditing ? "Save Changes" : "Submit for Review"}
              </Button>
            </Card>
          </div>
        )}
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