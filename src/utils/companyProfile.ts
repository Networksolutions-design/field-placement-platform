export const ENRICHMENT_FIELDS: Array<
  | "whatsapp"
  | "tagline"
  | "description"
  | "phone"
  | "poBox"
  | "city"
  | "region"
  | "website"
  | "preferredProgrammes"
  | "extraRequirements"
  | "logoUrl"
  | "coverUrl"
> = [
  "whatsapp",
  "tagline",
  "description",
  "phone",
  "poBox",
  "city",
  "region",
  "website",
  "preferredProgrammes",
  "extraRequirements",
  "logoUrl",
  "coverUrl",
];

export function getProfileCompletion(company: Record<string, unknown>): {
  percent: number;
  missing: string[];
} {
  const labels: Record<string, string> = {
    whatsapp: "WhatsApp number",
    tagline: "Tagline",
    description: "Description",
    phone: "Office phone",
    poBox: "P.O. Box",
    city: "City",
    region: "Region",
    website: "Website",
    preferredProgrammes: "Preferred programmes",
    extraRequirements: "Additional requirements",
    logoUrl: "Logo",
    coverUrl: "Cover image",
  };

  const socials =
    (company.socials as Record<string, unknown> | null) ?? {};
  const hasSocial = Object.values(socials).some(Boolean);

  const filled = ENRICHMENT_FIELDS.filter((field) => {
    const value = company[field];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });

  const missing = ENRICHMENT_FIELDS.filter((field) => !filled.includes(field)).map(
    (field) => labels[field]
  );
  if (!hasSocial) missing.push("At least one social media link");

  const totalFields = ENRICHMENT_FIELDS.length + 1;
  const filledCount = filled.length + (hasSocial ? 1 : 0);
  const percent = Math.round((filledCount / totalFields) * 100);

  return { percent, missing };
}