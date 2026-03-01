import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TopHeader({ title, showBack = false }) {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center h-14 px-4 bg-background border-b border-border"
      style={{ paddingTop: "env(safe-area-inset-top)", height: "calc(3.5rem + env(safe-area-inset-top))" }}>
      <div className="flex items-center w-full">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2 shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <h1 className="text-base font-semibold truncate">{title}</h1>
      </div>
    </header>
  );
}