import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useApp } from "@/context/AppContext";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Category, YearOfStudy } from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Upload,
  Image as ImageIcon,
  Building2,
  Clock,
  CheckCircle2,
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
  "Year 1",
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

interface FormState {
  name: string;
  tagline: string;
  categories: Category[];
  description: string;
  address: string;
  poBox: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  city: string;
  region: string;
  linkedin: string;
  instagram: string;
  twitter: string;
  facebook: string;
  acceptedYears: YearOfStudy[];
  preferredProgrammes: string[];
  additionalRequirements: string;
  applicationMethod: "office_visit" | "email_whatsapp";
  availableSlots: number;
  logoUrl: string;
  coverUrl: string;
}

const initialForm: FormState = {
  name: "",
  tagline: "",
  categories: [],
  description: "",
  address: "",
  poBox: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  city: "",
  region: "",
  linkedin: "",
  instagram: "",
  twitter: "",
  facebook: "",
  acceptedYears: [],
  preferredProgrammes: [],
  additionalRequirements: "",
  applicationMethod: "office_visit",
  availableSlots: 1,
  logoUrl: "",
  coverUrl: "",
};

const STEPS = ["Basic", "Contact & Location", "Placement", "Branding"];

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

export function AdminAddCompany() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validateStep(): boolean {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = "Company name is required";
      if (!form.tagline.trim()) e.tagline = "Tagline is required";
      if (form.categories.length === 0)
        e.categories = "Select at least one category";
      if (!form.description.trim()) e.description = "Description is required";
    }
    if (step === 1) {
      if (!form.address.trim()) e.address = "Address is required";
      if (!form.phone.trim()) e.phone = "Phone is required";
      if (!form.email.trim()) e.email = "Email is required";
      if (!form.city.trim()) e.city = "City is required";
    }
    if (step === 2) {
      if (form.acceptedYears.length === 0)
        e.acceptedYears = "Select at least one year";
      if (!form.availableSlots || form.availableSlots < 1)
        e.availableSlots = "Enter at least one available position";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  async function handleSubmit(status: "pending" | "approved") {
    if (!validateStep()) return;

    setLoading(true);

    try {
      const companyRef = doc(collection(db, "companies"));

      await setDoc(companyRef, {
        uid: companyRef.id,
        companyEmail: form.email,
        contactEmail: form.email,
        companyName: form.name,
        tagline: form.tagline,
        categories: form.categories,
        description: form.description,
        address: form.address,
        poBox: form.poBox,
        phone: form.phone,
        whatsapp: form.whatsapp,
        website: form.website || null,
        socials: {
          linkedin: form.linkedin || null,
          instagram: form.instagram || null,
          x: form.twitter || null,
          facebook: form.facebook || null,
        },
        coordinates: null,
        eligibleYears: form.acceptedYears,
        preferredProgrammes: form.preferredProgrammes,
        extraRequirements: form.additionalRequirements || null,
        applicationMethod: form.applicationMethod,
        availableSlots: form.availableSlots,
        logoUrl: form.logoUrl || null,
        coverUrl: form.coverUrl || null,
        status,
        rejectionReason: null,
        authorisedRepConfirmed: true,
        registeredByAdmin: true,
        adminViewed: status === "approved",
        emailVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        approvedAt: status === "approved" ? serverTimestamp() : null,
      });

      showToast(
        status === "approved"
          ? "Company added and approved"
          : "Company added as pending",
        "success"
      );
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin add company error:", error);
      showToast("Failed to add company. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-teal-600" />
          Add company
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Register a company on their behalf. Choose whether to send it through
          review or approve it immediately.
        </p>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    i < step
                      ? "bg-teal-600 text-white"
                      : i === step
                        ? "bg-teal-600 text-white ring-4 ring-teal-100"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 rounded ${i < step ? "bg-teal-600" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={`text-xs ${i === step ? "font-medium text-gray-900" : "text-gray-400"}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <Card className="p-6">
          {step === 0 && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <h2 className="text-lg font-semibold text-gray-900">
                Basic information
              </h2>
              <Input
                label="Company name"
                name="name"
                placeholder="e.g. Ardhi Surveyors Ltd"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tagline
                </label>
                <Input
                  name="tagline"
                  placeholder="A short, catchy one-liner about your company"
                  value={form.tagline}
                  maxLength={80}
                  onChange={(e) =>
                    setForm({ ...form, tagline: e.target.value })
                  }
                  error={errors.tagline}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-400">
                    {form.tagline.length}/80
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map((cat) => {
                    const selected = form.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            categories: toggleArrayItem(form.categories, cat),
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
                {errors.categories && (
                  <p className="mt-1 text-xs text-red-500">{errors.categories}</p>
                )}
              </div>
              <Textarea
                label="Description"
                name="description"
                placeholder="Describe what your company does and what students can expect during their placement"
                rows={5}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                error={errors.description}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <h2 className="text-lg font-semibold text-gray-900">
                Contact & location
              </h2>
              <Input
                label="Physical address"
                name="address"
                placeholder="e.g. 123 Mlimani Tower, Sam Nujoma Road"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                error={errors.address}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="P.O. Box"
                  name="poBox"
                  placeholder="e.g. 12345 DSM"
                  value={form.poBox}
                  onChange={(e) => setForm({ ...form, poBox: e.target.value })}
                />
                <Input
                  label="City"
                  name="city"
                  placeholder="e.g. Dar es Salaam"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  error={errors.city}
                />
              </div>
              <Input
                label="Region"
                name="region"
                placeholder="e.g. Dar es Salaam"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  name="phone"
                  placeholder="+255 22 123 4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  error={errors.phone}
                />
                <Input
                  label="WhatsApp"
                  name="whatsapp"
                  placeholder="+255 712 345 678"
                  value={form.whatsapp}
                  onChange={(e) =>
                    setForm({ ...form, whatsapp: formatWhatsApp(e.target.value) })
                  }
                />
              </div>
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="info@company.co.tz"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
              />
              <Input
                label="Website"
                name="website"
                placeholder="https://company.co.tz"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social media links (optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    name="linkedin"
                    placeholder="https://linkedin.com/company/..."
                    value={form.linkedin}
                    onChange={(e) =>
                      setForm({ ...form, linkedin: e.target.value })
                    }
                  />
                  <Input
                    name="instagram"
                    placeholder="https://instagram.com/..."
                    value={form.instagram}
                    onChange={(e) =>
                      setForm({ ...form, instagram: e.target.value })
                    }
                  />
                  <Input
                    name="twitter"
                    placeholder="https://twitter.com/..."
                    value={form.twitter}
                    onChange={(e) =>
                      setForm({ ...form, twitter: e.target.value })
                    }
                  />
                  <Input
                    name="facebook"
                    placeholder="https://facebook.com/..."
                    value={form.facebook}
                    onChange={(e) =>
                      setForm({ ...form, facebook: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Location preview
                </label>
                <div className="relative h-40 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "linear-gradient(#d1d5db 1px, transparent 1px), linear-gradient(90deg, #d1d5db 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center shadow-lg animate-bounce">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-600 bg-white/80 px-2 py-0.5 rounded">
                        {form.city || "Pin location"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <h2 className="text-lg font-semibold text-gray-900">
                Placement preferences
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accepted years of study
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_YEARS.map((year) => {
                    const selected = form.acceptedYears.includes(year);
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
                            setForm({
                              ...form,
                              acceptedYears: toggleArrayItem(
                                form.acceptedYears,
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
                {errors.acceptedYears && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.acceptedYears}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred programmes
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROGRAMME_OPTIONS.map((prog) => {
                    const selected = form.preferredProgrammes.includes(prog);
                    return (
                      <button
                        key={prog}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            preferredProgrammes: toggleArrayItem(
                              form.preferredProgrammes,
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
                label="Additional requirements"
                name="additionalRequirements"
                placeholder="e.g. Must have own laptop, must complete safety induction, etc."
                rows={3}
                value={form.additionalRequirements}
                onChange={(e) =>
                  setForm({ ...form, additionalRequirements: e.target.value })
                }
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  How should students apply?
                </label>
                <select
                  value={form.applicationMethod}
                  onChange={(e) =>
                    setForm({
                      ...form,
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
                min={1}
                placeholder="e.g. 5"
                value={form.availableSlots}
                onChange={(e) =>
                  setForm({ ...form, availableSlots: Number(e.target.value) })
                }
                error={errors.availableSlots}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
                    {form.logoUrl ? (
                      <img
                        src={form.logoUrl}
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
                            setForm({
                              ...form,
                              logoUrl: reader.result as string,
                            });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover image
                </label>
                <div className="relative h-40 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden">
                  {form.coverUrl ? (
                    <img
                      src={form.coverUrl}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
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
                          setForm({
                            ...form,
                            coverUrl: reader.result as string,
                          });
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            {step < STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSubmit("pending")}
                  disabled={loading}
                >
                  <Clock className="w-4 h-4" /> Save as Pending
                </Button>
                <Button onClick={() => handleSubmit("approved")} disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner className="w-4 h-4" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Save and Approve
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}