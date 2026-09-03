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
  updateDoc,
  serverTimestamp,
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
} from "lucide-react";
import { getProfileCompletion } from "@/utils/companyProfile";
import { ProfileCompletionBanner } from "@/components/company/ProfileCompletionBanner";

type CompanyProfileData = {
  companyName?: string;
  name?: string;
  tagline?: string;
  categories?: string[];
  eligibleYears?: string[];
  preferredProgrammes?: string[];
  address?: string;
  poBox?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  status?: string;
  availableSlots?: number;
  socials?: Record<string, string | null>;
  description?: string | null;
  extraRequirements?: string | null;
};

type StatsData = {
  totalViews?: number;
  totalSaves?: number;
  totalApplied?: number;
};

export function CompanyDashboard() {
  const navigate = useNavigate();
  const { firebaseUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [availableSlotsInput, setAvailableSlotsInput] = useState(0);

  useEffect(() => {
    if (!firebaseUser) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    const unsub = onSnapshot(
      doc(db, "companies", firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as CompanyProfileData;
          setProfile(data);
          setAvailableSlotsInput(Number(data.availableSlots ?? 1));
        } else {
          setProfile(null);
        }
        setLoadingProfile(false);
      },
      (error) => {
        console.error("Company dashboard load error:", error);
        setLoadingProfile(false);
      }
    );

    return unsub;
  }, [firebaseUser]);

  useEffect(() => {
    if (!firebaseUser) return;

    const unsub = onSnapshot(
      doc(db, "companyStats", firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          setStatsData(snap.data() as StatsData);
        } else {
          setStatsData(null);
        }
      },
      (error) => {
        console.error("Stats load error:", error);
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
            Register your company
          </Button>
        </div>
      </CompanyLayout>
    );
  }

  if (!profile) {
    return (
      <CompanyLayout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <p className="text-gray-500 mb-4">No company profile found.</p>
          <Button onClick={() => navigate("/institution/register")}>
            Register your company
          </Button>
        </div>
      </CompanyLayout>
    );
  }

  const companyName = String(profile.companyName ?? profile.name ?? "");
  const tagline = String(profile.tagline ?? "");
  const status = String(profile.status ?? "pending");
  const categories = Array.isArray(profile.categories)
    ? profile.categories.map(String)
    : [];
  const category = categories[0] ?? "Not set";
  const eligibleYears = Array.isArray(profile.eligibleYears)
    ? profile.eligibleYears.map(String)
    : [];
  const preferredProgrammes = Array.isArray(profile.preferredProgrammes)
    ? profile.preferredProgrammes.map(String)
    : [];
  const address = String(profile.address ?? "Not set");
  const logoUrl =
    typeof profile.logoUrl === "string" && profile.logoUrl.length > 0
      ? profile.logoUrl
      : null;
  

  // Profile completion
  const { percent, missing } = getProfileCompletion(
    profile as unknown as Record<string, unknown>
  );

  const isLive = status === "approved";
  const isPending = status === "pending";
  const isInactive = status === "suspended" || status === "rejected";

  const totalViews = Number(statsData?.totalViews ?? 0);
  const totalSaves = Number(statsData?.totalSaves ?? 0);
  const totalApplied = Number(statsData?.totalApplied ?? 0);

  const stats = [
    {
      label: "Total views",
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
      label: "Applied",
      value: totalApplied,
      icon: FileText,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  async function handleDeactivate() {
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, "companies", firebaseUser.uid), {
        status: "suspended",
        updatedAt: serverTimestamp(),
      });
      setToastMessage("Profile deactivated — you can contact admin to reactivate.");
      setShowDeactivate(false);
    } catch {
      setToastMessage("Failed to deactivate profile. Please try again.");
      setShowDeactivate(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/");
    } catch {
      setToastMessage("Logout failed.");
    }
  }

  async function updateAvailableSlots(newValue: number) {
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, "companies", firebaseUser.uid), {
        availableSlots: newValue,
        updatedAt: serverTimestamp(),
      });
      setToastMessage("Positions updated successfully.");
    } catch {
      setToastMessage("Failed to update positions.");
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

        <ProfileCompletionBanner
          percent={percent}
          missing={missing}
          onCompleteProfile={() => navigate("/company/profile/complete")}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ring-2 ring-gray-100 shrink-0 bg-teal-600">
                {companyName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
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
                  {isLive ? "Live" : isPending ? "Pending" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-gray-500">{tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate("/institution/register?tab=company&edit=company")
              }
            >
              <Pencil className="w-4 h-4" /> Edit Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/company/${firebaseUser.uid}`)}
            >
              <ExternalLink className="w-4 h-4" /> View Profile
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

        {/* Profile summary */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Profile summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-0.5">Category</p>
              <Badge variant="teal">{category}</Badge>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Location</p>
              <p className="text-gray-700">{address}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Accepted years</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {eligibleYears.length > 0 ? (
                  eligibleYears.map((y) => (
                    <Badge key={y} variant="gray">
                      {y}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-400">Not set</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Preferred programmes</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {preferredProgrammes.length > 0 ? (
                  preferredProgrammes.map((p) => (
                    <Badge key={p} variant="gray">
                      {p}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-400">Not set</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Positions available</p>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min={0}
                  value={availableSlotsInput}
                  onChange={(e) => setAvailableSlotsInput(Number(e.target.value))}
                  className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <Button
                  size="sm"
                  onClick={() => updateAvailableSlots(availableSlotsInput)}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Danger zone */}
        {isLive && (
          <Card className="p-6 border-red-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Danger zone
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Deactivating hides your profile from students. You can reactivate
              later.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeactivate(true)}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <AlertTriangle className="w-4 h-4" /> Deactivate Profile
            </Button>
          </Card>
        )}
      </div>

      {/* Deactivate confirm dialog */}
      {showDeactivate && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setShowDeactivate(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-1">
              Deactivate profile?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Your company will be hidden from students. You can contact admin to
              reactivate.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeactivate(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800"
                onClick={handleDeactivate}
              >
                Deactivate
              </Button>
            </div>
          </div>
        </div>
      )}
    </CompanyLayout>
  );
}