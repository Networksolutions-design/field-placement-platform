import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { YearOfStudy } from "@/types";
import { ArrowLeft, GraduationCap } from "lucide-react";

const universities = [
  "Ardhi University",
  "University of Dar es Salaam",
  "Sokoine University of Agriculture",
  "Dar es Salaam Institute of Technology",
  "State University of Zanzibar",
  "Other",
];

const years: YearOfStudy[] = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Postgraduate",
];

function mapYearToFirestore(year: YearOfStudy): string {
  switch (year) {
    case "Year 1":
      return "1st";
    case "Year 2":
      return "2nd";
    case "Year 3":
      return "3rd";
    case "Year 4":
      return "4th";
    case "Year 5":
      return "5th";
    default:
      return year;
  }
}

export function StudentOnboarding() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { firebaseUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    university: "",
    programme: "",
    yearOfStudy: "Year 3" as YearOfStudy,
    bio: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!form.university) errs.university = "Select your university";
    if (!form.programme.trim()) errs.programme = "Enter your course";
    if (!form.yearOfStudy) errs.yearOfStudy = "Select your year";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!firebaseUser) {
      showToast("No user session found. Please sign up again.", "error");
      return;
    }

    setSubmitting(true);

    try {
      await updateDoc(doc(db, "students", firebaseUser.uid), {
        university: form.university,
        course: form.programme,
        yearOfStudy: mapYearToFirestore(form.yearOfStudy),
        bio: form.bio,
        updatedAt: serverTimestamp(),
      });

      showToast("Profile set up — welcome aboard!", "success");
      navigate("/explore");
    } catch {
      showToast("Failed to save profile. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Tell us about your studies
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          We use this to match you with the right field placements.
        </p>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5 text-teal-600">
            <GraduationCap className="w-5 h-5" />
            <span className="text-sm font-medium">Academic profile</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="University"
              name="university"
              value={form.university}
              onChange={(e) => setForm({ ...form, university: e.target.value })}
              error={errors.university}
            >
              <option value="">Select your university</option>
              {universities.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
            <Input
              label="Course / programme"
              name="programme"
              placeholder="e.g. B.Sc. Land Management and Valuation"
              value={form.programme}
              onChange={(e) => setForm({ ...form, programme: e.target.value })}
              error={errors.programme}
            />
            <Select
              label="Year of study"
              name="yearOfStudy"
              value={form.yearOfStudy}
              onChange={(e) =>
                setForm({ ...form, yearOfStudy: e.target.value as YearOfStudy })
              }
              error={errors.yearOfStudy}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
            <Textarea
              label="Short bio (optional)"
              name="bio"
              rows={3}
              placeholder="Tell companies a bit about your interests and goals."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Finish & explore"}
            </Button>
          </form>
        </Card>
        <button
          onClick={() => navigate("/explore")}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" /> Skip for now
        </button>
      </div>
    </PublicLayout>
  );
}