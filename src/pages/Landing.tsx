import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Logo } from "@/components/ui/Logo";
import { mockCompanies } from "@/data/mockCompanies";
import {
  Search,
  Building2,
  MessageSquare,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  MapPin,
} from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover companies",
    description:
      "Browse verified Tanzanian companies offering field and industrial training in your programme.",
  },
  {
    icon: MessageSquare,
    title: "Apply directly",
    description:
      "Send your application straight to the company. No middlemen, no paperwork queues.",
  },
  {
    icon: CheckCircle2,
    title: "Start your placement",
    description:
      "Track your application status and connect with your placement supervisor.",
  },
];

const categories = [
  "Valuation",
  "Land Surveying",
  "GIS & Mapping",
  "Real Estate",
  "Construction",
  "Accounting",
  "IT",
  "Engineering",
];

export function Landing() {
  const featured = mockCompanies.filter((c) => c.verified).slice(0, 3);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 to-white py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center">
            <Badge variant="teal" className="mb-4">
              <ShieldCheck className="w-3 h-3" /> Verified companies only
            </Badge>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight max-w-3xl">
              Discover your{" "}
              <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                field placement
              </span>
              . Connect directly with companies that want you.
            </h1>

            <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
              The platform connects Tanzanian university students with verified
              companies offering field and industrial training. No more
              wandering campus notice boards.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
              <Link to="/student/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  🎓 Student <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/institution/register" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Building2 className="w-4 h-4" /> 🏛️ Institution
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" /> 8+ universities
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> {mockCompanies.length} companies
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How it works</h2>
          <p className="mt-2 text-gray-500">Three steps from discovery to placement.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-400">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Training categories
        </h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge key={cat} variant="gray" className="text-sm py-1.5 px-3">
              {cat}
            </Badge>
          ))}
        </div>
      </section>

      {/* Featured companies */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Featured companies
            </h2>
            <p className="mt-2 text-gray-500">A few of our verified partners.</p>
          </div>
          <Link
            to="/explore"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featured.map((company) => (
            <Card key={company.id} hover className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <Logo name={company.name} color={company.logoColor} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {company.name}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {company.location.city}
                  </p>
                </div>
                {company.verified && (
                  <Badge variant="green">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {company.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="teal">{company.category}</Badge>
                <span className="text-xs text-gray-400">
                  {company.trainingDetails.slotsAvailable} slots
                </span>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link to="/explore">
            <Button variant="outline" className="w-full">
              View all companies <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to find your placement?
          </h2>
          <p className="mt-3 text-gray-400">
            Join the platform and connect with companies in minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/student/signup">
              <Button size="lg">Get started as a student</Button>
            </Link>
            <Link to="/institution/register">
              <Button size="lg" variant="outline" className="bg-transparent border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500">
                List your institution
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}