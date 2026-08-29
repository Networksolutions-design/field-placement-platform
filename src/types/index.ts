export type Category =
  | "Valuation"
  | "Land Surveying"
  | "GIS & Mapping"
  | "Real Estate"
  | "Construction"
  | "Accounting"
  | "IT"
  | "Engineering";

export type YearOfStudy =
  | "Year 1"
  | "Year 2"
  | "Year 3"
  | "Year 4"
  | "Year 5"
  | "Postgraduate";

export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp: string;
  website?: string;
  contactPerson: string;
  poBox: string;
}

export interface Location {
  city: string;
  region: string;
  address: string;
}

export interface TrainingDetails {
  duration: string;
  stipend: string;
  slotsAvailable: number;
  applicationDeadline: string;
  requirements: string[];
}

export type CompanyStatus = "live" | "pending" | "inactive";
export type InstitutionType = "company" | "university";

export interface Company {
  id: string;
  name: string;
  tagline: string;
  category: Category;
  establishedYear: number;
  verified: boolean;
  description: string;
  location: Location;
  acceptedYears: YearOfStudy[];
  preferredProgrammes: string[];
  contactInfo: ContactInfo;
  socialLinks: SocialLinks;
  trainingDetails: TrainingDetails;
  rating: number;
  reviewCount: number;
  logoColor: string;
  logoUrl: string;
  coverUrl: string;
  status: CompanyStatus;
  additionalRequirements: string;
  adminViewed?: boolean;
  registeredByAdmin?: boolean;
  type: InstitutionType;
}

export interface University {
  id: string;
  name: string;
  acronym: string;
  tcuRegistrationNumber: string;
  universityType: "Public" | "Private";
  establishedYear: number;
  email: string;
  password: string;
  address: string;
  poBox: string;
  phone: string;
  website: string;
  logoUrl: string;
  logoColor: string;
  status: CompanyStatus;
  verified: boolean;
  adminViewed?: boolean;
  registeredByAdmin?: boolean;
  type: InstitutionType;
  coordinatorWhatsApp?: string;
}

export interface Student {
  id: string;
  fullName: string;
  email: string;
  password: string;
  university: string;
  programme: string;
  yearOfStudy: YearOfStudy;
  registrationNumber: string;
  phone: string;
  location: { city: string; region: string };
  bio: string;
  avatarUrl: string;
  skills: string[];
  interests: string[];
  cvUrl: string;
  completedOnboarding: boolean;
  expectedGraduationYear?: string;
  languages?: string[];
  portfolioUrl?: string;
  photos?: string[];
}

export interface Application {
  id: string;
  companyId: string;
  studentId: string;
  status: ApplicationStatus;
  appliedAt: string;
  coverLetter: string;
  documents: string[];
}

export interface CompanyDashboardStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
