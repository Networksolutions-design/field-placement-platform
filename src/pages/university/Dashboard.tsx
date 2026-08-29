import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CompanyLayout } from "@/components/layout/CompanyLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import {
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Eye,
  Bookmark,
  FileText,
  Pencil,
  ExternalLink,
  AlertTriangle,
  Clock,
  LogOut,
  Users,
  GraduationCap,
  Building2,
} from "lucide-react";

type UniversityProfileData = {
  universityName?: string;
  acronym?: string;
  universityType?: string;
  tcuRegistrationNumber?: string;
  yearEstablished?: number;
  address?: string;
  phone?: string;
  website?: string;
  coordinatorWhatsapp?: string | null;
  logoUrl?: string | null;
  status?: string;
};

type UniversityStatsData = {
  totalViews?: number;
  totalSaves?: number;
  totalApplied?: number;
};

export function UniversityDashboard() {
  const navigate = useNavigate();
  const { firebaseUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UniversityProfileData | null>(null);
  const [statsData, setStatsData] = useState<UniversityStatsData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    const unsub = onSnapshot(
      doc(db, "universities", firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UniversityProfileData);
        } else {
          setProfile(null);
        }
        setLoadingProfile(false);
      },
      (error) => {
        console.error("University dashboard load error:", error);
        setLoadingProfile(false);
      }
    );

    return unsub;
  }, [firebaseUser]);

  useEffect(() => {
    if (!firebaseUser) return;

    const unsub = onSnapshot(
      doc(db, "universityStats", firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          setStatsData(snap.data() as UniversityStatsData);
        } else {
          setStatsData(null);
        }
      },
      (error) => {
        console.error("University stats load error:", error);
      }
    );

    return unsub;
  }, [firebaseUser]);

  if (authLoading || loadingProfile) {
    return (
      <CompanyLayout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <p className="text-gray-500">Loading dashboard…</p>
        </div>
      </CompanyLayout>
    );
  }

  if (!firebaseUser) {
    return (
      <CompanyLayout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <p className="text-gray-500 mb-4">No user session found.</p>
          <Button onClick={() => navigate("/institution/register")}>
            Register your university
          </Button>
        </div>
      </CompanyLayout>
    );
  }

  if (!profile) {
    return (
      <CompanyLayout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <p className="text-gray-500 mb-4">No university profile found.</p>
          <Button onClick={() => navigate("/institution/register?tab=university")}>
            Register your university
          </Button>
        </div>
      </CompanyLayout>
    );
  }

  const universityName = String(profile.universityName ?? "");
  const acronym = String(profile.acronym ?? "");
  const universityType = String(profile.universityType ?? "");
  const tcuReg = String(profile.tcuRegistrationNumber ?? "");
  const yearEstablished = Number(profile.yearEstablished ?? 0);
  const address = String(profile.address ?? "Not set");
  const phone = String(profile.phone ?? "Not set");

  const status = String(profile.status ?? "pending");
  const isLive = status === "approved";
  const isPending = status === "pending";
  const isInactive = status === "suspended" || status === "rejected";

  const totalViews = Number(statsData?.totalViews ?? 0);
  const totalSaves = Number(statsData?.totalSaves ?? 0);
  const totalApplied = Number(statsData?.totalApplied ?? 0);

  const totalStudentsOnPlatform = 0;
  const studentsFromYourUniversity = 0;

  const stats = [
    {
      label: "Profile views",
      value: totalViews,
      icon: Eye,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Saves",
      value: totalSaves,
      icon: Bookmark,
      color: "text-teal-600 bg-teal-50",
    },
    {
      label: "Applied marks",
      value: totalApplied,
      icon: FileText,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Students on Platform",
      value: totalStudentsOnPlatform,
      icon: Users,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Students from Your University",
      value: studentsFromYourUniversity,
      icon: GraduationCap,
      color: "text-teal-600 bg-teal-50",
    },
  ];

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/");
    } catch {
      setToastMessage("Logout failed.");
    }
  }

  return (
    <CompanyLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {toastMessage && (
          <div className="mb-4 rounded-lg bg-gray-800 text-white text-sm px-4 py-2.5">
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{universityName}</h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isLive
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : isPending
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isLive
                      ? "bg-green-500 animate-pulse"
                      : isPending
                        ? "bg-amber-500"
                        : "bg-gray-400"
                  }`}
                />
                {isLive ? "Live" : isPending ? "Pending Approval" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {acronym} · {universityType} University
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/explore")}
            >
              <Building2 className="w-4 h-4" /> Browse Companies
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/institution/register?tab=university&edit=university")}
            >
              <Pencil className="w-4 h-4" /> Edit Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/university/${firebaseUser.uid}`)}
            >
              <ExternalLink className="w-4 h-4" /> View Public Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </Button>
          </div>
        </div>

        {/* Pending banner */}
        {isPending && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              Your profile is pending approval. Students can't see it yet. You'll
              be notified once an admin reviews it.
            </p>
          </div>
        )}

        {/* Inactive banner */}
        {isInactive && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-gray-500 shrink-0" />
              <p className="text-sm text-gray-600">
                Your profile is not visible to students.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Browse companies */}
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate("/explore")}>
            <Building2 className="w-4 h-4" /> Browse Companies
          </Button>
        </div>

        {/* Profile summary */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Profile summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-0.5">Acronym</p>
              <Badge variant="teal">{acronym}</Badge>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Type</p>
              <p className="text-gray-700">{universityType} University</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">TCU Registration</p>
              <p className="text-gray-700">{tcuReg}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Established</p>
              <p className="text-gray-700">{yearEstablished || "—"}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Location</p>
              <p className="text-gray-700">{address}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Contact</p>
              <p className="text-gray-700">{phone}</p>
            </div>
          </div>
        </Card>
      </div>
    </CompanyLayout>
  );
}