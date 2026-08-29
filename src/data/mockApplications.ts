import type { Application } from "@/types";

export const mockApplications: Application[] = [
  {
    id: "a1",
    companyId: "c1",
    studentId: "s1",
    status: "pending",
    appliedAt: "2026-07-18",
    coverLetter:
      "I am a third-year Land Management and Valuation student at Ardhi University. I am eager to gain hands-on cadastral surveying experience with Ardhi Surveyors Ltd.",
    documents: ["Application letter", "CV", "Student ID"],
  },
  {
    id: "a2",
    companyId: "c3",
    studentId: "s1",
    status: "accepted",
    appliedAt: "2026-06-30",
    coverLetter:
      "I have basic GIS knowledge and would love to deepen it through GeoSpatial Tanzania's training programme.",
    documents: ["Application letter", "CV"],
  },
  {
    id: "a3",
    companyId: "c4",
    studentId: "s1",
    status: "rejected",
    appliedAt: "2026-06-12",
    coverLetter:
      "Interested in real estate rotation to understand property transactions.",
    documents: ["Application letter", "CV", "Student ID"],
  },
];
