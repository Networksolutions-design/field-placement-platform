import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArrowLeft } from "lucide-react";

export function Privacy() {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: July 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-600">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              1. Information we collect
            </h2>
            <p>
              We collect information you provide directly: your name, email,
              university or company details, and application materials. For
              students, this includes your programme, year of study, skills, and
              interests. For companies, this includes contact details and
              placement information.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              2. How we use your information
            </h2>
            <p>
              Student information is used to match you with relevant field
              placement opportunities and to display your profile to companies
              you apply to. Company information is used to display your listing
              to students. We do not sell your personal information to third
              parties.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              3. Data visibility
            </h2>
            <p>
              Student profiles are visible to companies you have applied to.
              Company profiles that are approved are visible to all students
              browsing the platform. Admins can view all profiles for
              verification and moderation purposes.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              4. Data retention
            </h2>
            <p>
              You may request deletion of your account and associated data at
              any time. Company profiles that are deactivated can be
              reactivated; permanently deleted profiles cannot be recovered.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              5. Reporting and moderation
            </h2>
            <p>
              Users can report profiles that violate our terms. Our admin team
              reviews reports and may suspend profiles pending investigation.
              Reported users will be notified when action is taken.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              6. Contact
            </h2>
            <p>
              Privacy questions can be directed to our admin team. This is a
              prototype platform and this policy is provided for demonstration
              purposes only.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
