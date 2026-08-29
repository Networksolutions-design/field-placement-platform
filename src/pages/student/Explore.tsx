import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { UniversityBrowseLayout } from "@/components/layout/UniversityBrowseLayout";
import { CompanyCard } from "@/components/company/CompanyCard";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import type { Category, Company } from "@/types";

const CATEGORIES: (Category | "All")[] = [
  "All",
  "Valuation",
  "Land Surveying",
  "GIS & Mapping",
  "Real Estate",
  "Construction",
  "Accounting",
  "IT",
  "Engineering",
];

type FirestoreCompany = {
  id: string;
  companyName?: string;
  name?: string;
  categories?: string[];
  eligibleYears?: string[];
  coverUrl?: string | null;
  logoUrl?: string | null;
  status?: string;
};

type StudentProfileData = {
  yearOfStudy?: string;
};

export function Explore() {
  const { companies } = useData();
  const { role, profile } = useAuth();

  const isUniversity = role === "university";
  const studentYear = (profile as StudentProfileData | null)?.yearOfStudy ?? null;

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");

  const filtered = useMemo(() => {
    return (companies as FirestoreCompany[]).filter((c) => {
      const name = String(c.companyName ?? c.name ?? "");
      const categories = Array.isArray(c.categories)
        ? c.categories.map(String)
        : [];

      const matchesSearch =
        search === "" ||
        name.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "All" || categories.includes(activeCategory);

      return matchesSearch && matchesCategory;
    });
  }, [companies, search, activeCategory]);

  const Layout = isUniversity ? UniversityBrowseLayout : StudentLayout;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Heading */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Explore companies</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} {filtered.length === 1 ? "company" : "companies"} offering field placements
          </p>
        </div>

        {/* Sticky search + filters */}
        <div className="sticky top-16 z-20 -mx-4 px-4 py-3 bg-gray-50/95 backdrop-blur-sm">
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company name..."
              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Horizontal filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-800"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
            {filtered.map((c) => {
              const companyName = String(c.companyName ?? c.name ?? "");
              const categories = Array.isArray(c.categories)
                ? c.categories.map(String)
                : [];
              const category = categories.length > 0
                ? categories[0]
                : "Valuation";

              const cardCompany = {
                id: c.id,
                name: companyName,
                coverUrl: typeof c.coverUrl === "string" ? c.coverUrl : "",
                verified: c.status === "approved",
                logoUrl: typeof c.logoUrl === "string" ? c.logoUrl : "",
                logoColor: "#0d9488",
                category: category as Category,
              } as unknown as Company;

              const eligibleYears = Array.isArray(c.eligibleYears)
                ? c.eligibleYears.map(String)
                : [];

              const matchesYear =
                !isUniversity &&
                Boolean(studentYear && eligibleYears.includes(studentYear));

              return (
                <CompanyCard
                  key={c.id}
                  company={cardCompany}
                  matchesYear={matchesYear}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No companies found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try a different search or category filter.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}