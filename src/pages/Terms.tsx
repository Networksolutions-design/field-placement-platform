import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArrowLeft } from "lucide-react";

export function Terms() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: July 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-600">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              1. Acceptance of terms
            </h2>
            <p>
              By accessing or using The Platform, you agree to be bound by these
              Terms of Service. If you do not agree, please do not use the
              platform. These terms apply to both students seeking field
              placements and companies offering them.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              2. Company listings
            </h2>
            <p>
              Companies are responsible for providing accurate information about
              their field placement opportunities. All company profiles are
              reviewed by our admin team before going live. We reserve the right
              to reject or remove listings that contain misleading, false, or
              inappropriate content.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              3. Student applications
            </h2>
            <p>
              Students are responsible for the accuracy of their profile
              information and application materials. The Platform facilitates
              connections between students and companies but does not guarantee
              placement. Companies make final selection decisions independently.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              4. Acceptable use
            </h2>
            <p>
              Users must not use The Platform to harass, discriminate, or engage
              in any unlawful activity. Reported profiles will be reviewed and
              may be suspended. Users must respect the privacy and rights of
              others on the platform.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              5. Limitation of liability
            </h2>
            <p>
              The Platform is provided "as is" without warranties of any kind. We
              are not liable for the outcome of any placement, the accuracy of
              company-provided information, or any disputes between students and
              companies.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              6. Contact
            </h2>
            <p>
              Questions about these terms can be directed to our admin team
              through the Admin Console. This is a prototype platform and these
              terms are provided for demonstration purposes only.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
