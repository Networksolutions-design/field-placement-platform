import { useNavigate } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { motion } from "motion/react";
import type { Company } from "@/types";

interface CompanyCardProps {
  company: Company;
  matchesYear: boolean;
}

export function CompanyCard({ company, matchesYear }: CompanyCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.18)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => navigate(`/company/${company.id}`)}
      className="group relative w-full aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-md"
    >
      {/* Cover / gradient background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={
          company.coverUrl
            ? { backgroundImage: `url(${company.coverUrl})` }
            : company.logoUrl
              ? {
                  backgroundImage: `url(${company.logoUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  backgroundImage:
                    "linear-gradient(135deg, #0d9488 0%, #ccfbf1 100%)",
                }
        }
      />

      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      {/* Verified badge */}
      {company.verified && (
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
          <BadgeCheck className="w-3 h-3" />
          Verified
        </span>
      )}

      {/* Bottom info panel */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <div className="flex items-center gap-2 mb-1.5">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/80 shrink-0"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/80 shrink-0"
              style={{ backgroundColor: company.logoColor }}
            >
              {company.name.charAt(0)}
            </div>
          )}
          <h3 className="font-bold text-sm leading-tight truncate">
            {company.name}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white">
            {company.category}
          </span>
          {matchesYear && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              Matches your year
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}