import React, { useState } from "react";
// Layout v2
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { 
  Sparkles, BookOpen, PlusCircle, Menu, X, Zap, Users, Film, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LangProvider, useLang } from "@/components/i18n/i18n";
import LangSwitcher from "@/components/ui/LangSwitcher";

function LayoutInner({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLang();
  const n = t.nav;

  const navItems = [
    { name: "Home", label: n.home, icon: Sparkles },
    { name: "CreateComic", label: n.create, icon: PlusCircle },
    { name: "MyComics", label: n.myComics, icon: BookOpen },
    { name: "MyCharacters", label: n.characters, icon: Users },
    { name: "CoverGenerator", label: n.covers, icon: Zap },
    { name: "AnimatedShorts", label: n.shorts, icon: Film },
    { name: "MyDrafts", label: n.drafts, icon: FileText },
  ];

  const isHome = currentPageName === "Home";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <style>{`
        .glass-nav {
          background: rgba(10, 10, 15, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.15);
        }
        .glow-text {
          text-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
        }
        .nav-link-active {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1));
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
      `}</style>

      {/* Navigation */}
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Comic<span className="text-violet-400">Crafter</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPageName === item.name;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "nav-link-active text-violet-300"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Lang + Mobile Toggle */}
            <div className="flex items-center gap-2">
              <LangSwitcher />
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-400"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPageName === item.name;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.name)}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "nav-link-active text-violet-300"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className={isHome ? "" : "pt-20"}>
        {children}
      </main>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LangProvider>
      <LayoutInner currentPageName={currentPageName}>
        {children}
      </LayoutInner>
    </LangProvider>
  );
}