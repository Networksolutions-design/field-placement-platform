import { useNavigate } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import type { Company } from "@/types";

interface CompanyCardProps {
  company: Company;
  matchesYear: boolean;
}

export function CompanyCard({ company, matchesYear }: CompanyCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/company/${company.id}`)}
      className="group flex flex-col items-center justify-center w-full cursor-pointer transition-all duration-300 hover:scale-105"
    >
      {/* Top image area */}
      <div
        className="relative w-full h-40 sm:h-48 rounded-lg shadow-md bg-cover bg-center overflow-hidden transition-all duration-300 group-hover:shadow-xl"
      style={
  company.coverUrl
    ? { backgroundImage: `url(${company.coverUrl})` }
    : company.logoUrl
      ? {
          backgroundImage: `url(${company.logoUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundImage: "linear-gradient(135deg, #0d9488 0%, #ccfbf1 100%)" }
}
      >
        {company.verified && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-teal-600 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
            <BadgeCheck className="w-3 h-3" />
            Verified
          </span>
        )}
      </div>

      {/* Overlapping floating panel */}
      <div className="w-[88%] -mt-10 overflow-hidden bg-white rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-xl dark:bg-gray-800">
        {/* Logo + name */}
        <div className="flex flex-col items-center pt-2">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="w-12 h-12 -mt-6 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shrink-0"
            />
          ) : (
            <div
              className="w-12 h-12 -mt-6 rounded-full flex items-center justify-center text-white font-bold text-lg ring-4 ring-white dark:ring-gray-800 shrink-0"
              style={{ backgroundColor: company.logoColor }}
            >
              {company.name.charAt(0)}
            </div>
          )}
          <h3 className="py-2 px-2 font-bold tracking-wide text-center text-gray-800 uppercase text-sm dark:text-white truncate w-full">
            {company.name}
          </h3>
        </div>

        {/* Bottom row: category + year match */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700">
          <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
            {company.category}
          </span>
          {matchesYear && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Matches your year
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
