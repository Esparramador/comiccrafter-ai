import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

/**
 * A Select that uses a bottom-sheet Drawer on mobile, standard popover on desktop.
 * Props: value, onValueChange, placeholder, options: [{value, label}], className
 */
export default function MobileSelect({ value, onValueChange, placeholder, options = [], className }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring ${className || ""}`}
        >
          <span className={selectedLabel ? "text-foreground" : "text-muted-foreground"}>
            {selectedLabel || placeholder || "Seleccionar..."}
          </span>
          <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{placeholder || "Seleccionar"}</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col px-4 pb-6 gap-1" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onValueChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                    opt.value === value
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-accent"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}