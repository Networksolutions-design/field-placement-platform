import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Construction } from "lucide-react";

export function PlaceholderPage({
  title,
  description,
  ctaLabel,
  ctaTo,
  layout = "student",
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaTo?: string;
  layout?: "student" | "company" | "admin";
}) {
  const navigate = useNavigate();
  const content: ReactNode = (
    <div className="max-w-md mx-auto px-4 py-16">
      <Card className="p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
          <Construction className="w-7 h-7 text-amber-500" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-600 mb-6">{description}</p>
        {ctaLabel && ctaTo && (
          <Button variant="outline" className="w-full" onClick={() => navigate(ctaTo)}>
            {ctaLabel}
          </Button>
        )}
      </Card>
    </div>
  );

  if (layout === "company") {
    return <StudentLayout>{content}</StudentLayout>;
  }
  return <StudentLayout>{content}</StudentLayout>;
}
