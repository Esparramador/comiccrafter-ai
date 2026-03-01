import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, BookOpen, Film, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Inicio", icon: Home, page: "Home" },
  { label: "Cómics", icon: BookOpen, page: "Comics" },
  { label: "Vídeos", icon: Film, page: "Videos" },
  { label: "Perfil", icon: User, page: "Profile" },
  { label: "Ajustes", icon: Settings, page: "Settings" },
];

export default function BottomTabs({ currentPage }) {
  const navigate = useNavigate();

  const handleTabClick = (e, page) => {
    if (currentPage === page) {
      e.preventDefault();
      navigate(createPageUrl(page), { replace: true });
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex bg-background border-t border-border bottom-tabs-safe"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map(({ label, icon: Icon, page }) => {
        const active = currentPage === page;
        return (
          <Link
            key={page}
            to={createPageUrl(page)}
            onClick={(e) => handleTabClick(e, page)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-2 gap-0.5 text-xs transition-colors",
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}