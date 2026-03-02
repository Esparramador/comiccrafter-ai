import { useState } from "react";
import { useAuth } from "./auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Crown, ShoppingBag, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

const SERVICE_LABEL_KEYS: Record<string, string> = {
  "generate-character-image": "credits.generateCharImage",
  "generate-cover": "credits.generateCover",
  "generate-comic-page": "credits.generateComicPage",
  "generate-image": "credits.generateImage",
  "manus-gallery": "credits.manusGallery",
  "gallery-batch": "credits.galleryBatch",
  "generate-3d": "credits.generate3DText",
  "generate-3d-from-image": "credits.generate3DImage",
  "generate-3d-multiview": "credits.generate3DMultiview",
  "3d-retopology": "credits.retopology",
  "3d-rig": "credits.rig",
  "3d-animate": "credits.animate",
  "3d-texture": "credits.texture",
  "3d-stylize": "credits.stylize",
  "3d-convert": "credits.convert",
  "3d-download": "credits.download3d",
  "generate-voice": "credits.generateVoice",
  "generate-video": "credits.generateVideo",
};

const CREDIT_COSTS: Record<string, number> = {
  "generate-script": 0,
  "generate-character-text": 0,
  "generate-character-image": 5,
  "generate-cover": 5,
  "generate-comic-page": 5,
  "generate-image": 5,
  "manus-gallery": 15,
  "gallery-batch": 15,
  "generate-3d": 10,
  "generate-3d-from-image": 10,
  "generate-3d-multiview": 35,
  "3d-retopology": 8,
  "3d-rig": 15,
  "3d-animate": 15,
  "3d-texture": 8,
  "3d-stylize": 8,
  "3d-convert": 2,
  "3d-download": 0,
  "generate-voice": 3,
  "generate-video": 8,
  "gemini-chat": 0,
  "gemini-analyze": 0,
  "economist": 0,
};

export function getCreditCost(service: string): number {
  return CREDIT_COSTS[service] ?? 0;
}

export function getServiceLabel(service: string, t: (key: string, options?: any) => string): string {
  const key = SERVICE_LABEL_KEYS[service];
  return key ? t(key) : service;
}

export function CreditBadge({ service }: { service: string }) {
  const { isSuperUser } = useAuth();
  const { t } = useTranslation();
  const cost = getCreditCost(service);

  if (isSuperUser) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300" data-testid={`badge-cost-${service}`}>
        <Crown className="w-3 h-3" /> {t("credits.free")}
      </span>
    );
  }

  if (cost === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-300" data-testid={`badge-cost-${service}`}>
        {t("credits.free")}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300" data-testid={`badge-cost-${service}`}>
      <Coins className="w-3 h-3" /> {cost} {t("credits.credits")}
    </span>
  );
}

export function CreditPaywall({ open, onClose, service, cost, userCredits }: {
  open: boolean;
  onClose: () => void;
  service: string;
  cost: number;
  userCredits: number;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f111a] border-amber-500/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" /> {t("credits.insufficient")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-slate-300">
            {t("credits.needCredits", { service: getServiceLabel(service, t), cost })}
          </p>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm text-slate-400">{t("credits.yourBalance")}</span>
            <span className="text-lg font-bold text-red-400 flex items-center gap-1">
              <Coins className="w-4 h-4" /> {userCredits}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm text-slate-400">{t("credits.needMore")}</span>
            <span className="text-lg font-bold text-amber-300 flex items-center gap-1">
              <Coins className="w-4 h-4" /> {cost - userCredits} {t("credits.more")}
            </span>
          </div>
          <Link href="/tienda" onClick={onClose}>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold mt-2" data-testid="button-go-to-tienda">
              <ShoppingBag className="w-4 h-4 mr-2" /> {t("credits.goToStore")}
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useCredits() {
  const { user, isSuperUser, token, refreshUser } = useAuth();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallService, setPaywallService] = useState("");
  const [paywallCost, setPaywallCost] = useState(0);

  const checkCredits = (service: string): boolean => {
    if (isSuperUser) return true;
    const cost = getCreditCost(service);
    if (cost === 0) return true;
    if ((user?.credits || 0) >= cost) return true;
    setPaywallService(service);
    setPaywallCost(cost);
    setPaywallOpen(true);
    return false;
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const handleApiError = async (res: Response) => {
    if (res.status === 402) {
      const data = await res.json();
      setPaywallService(data.service || "");
      setPaywallCost(data.creditRequired || 0);
      setPaywallOpen(true);
      refreshUser();
      return true;
    }
    return false;
  };

  const PaywallModal = () => (
    <CreditPaywall
      open={paywallOpen}
      onClose={() => setPaywallOpen(false)}
      service={paywallService}
      cost={paywallCost}
      userCredits={user?.credits || 0}
    />
  );

  return {
    credits: user?.credits || 0,
    isSuperUser,
    checkCredits,
    getAuthHeaders,
    handleApiError,
    refreshUser,
    PaywallModal,
  };
}
