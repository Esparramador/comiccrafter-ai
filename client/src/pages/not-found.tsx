import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0D17]">
      <Card className="w-full max-w-md mx-4 bg-[#111322] border-white/10">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-white">{t("notFound.title")}</h1>
          </div>

          <p className="mt-4 text-sm text-white/60">
            {t("notFound.description")}
          </p>

          <Link href="/">
            <Button className="mt-6 w-full bg-purple-600 hover:bg-purple-500 text-white">
              {t("notFound.goHome")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
