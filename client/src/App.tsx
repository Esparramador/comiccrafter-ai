import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Hub from "./pages/hub";
import StoryWeaver from "./pages/story-weaver";
import Forge3D from "./pages/forge-3d";
import VoiceStudio from "./pages/voice-studio";

import AdminDashboard from "./pages/admin-dashboard";
import Personajes from "./pages/personajes";
import CrearVideo from "./pages/crear-video";
import MisVideos from "./pages/mis-videos";
import MisImagenes from "./pages/mis-imagenes";
import MisVoces from "./pages/mis-voces";
import Login from "./pages/login";

import CrearPersonaje from "./pages/crear-personaje";
import Tienda from "./pages/tienda";
import { PrivacyPolicy, TermsOfService, LegalNotice, DeleteAccount } from "./pages/legal";

import { Home, Sparkles, BookOpen, Video, Users, LogOut, ChevronDown, Lock, ShieldAlert, Image as ImageIcon, FileVideo, Mic2, Hammer, Wand2, Menu, X, ShoppingBag, Loader2, Coins, Crown } from "lucide-react";
import { Button } from "./components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "./components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
import logoImg from "./assets/images/logo.png";
import { AuthProvider, useAuth } from "./lib/auth";

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D17] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
}

const LANGUAGES = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

function useNavLinks() {
  const { t } = useTranslation();
  return [
    { href: "/", icon: Home, label: t("nav.home"), group: "main" },
    { href: "/story-weaver", icon: BookOpen, label: t("nav.storyWeaver"), group: "crear" },
    { href: "/video", icon: Video, label: t("nav.video"), group: "crear" },
    { href: "/forge-3d", icon: Hammer, label: t("nav.models3d"), group: "crear" },
    { href: "/voice", icon: Mic2, label: t("nav.voices"), group: "crear", accent: "emerald" },
    { href: "/crear-personaje", icon: Wand2, label: t("nav.createCharacter"), group: "crear", accent: "blue" },
    { href: "/personajes", icon: Users, label: t("nav.characters"), group: "biblioteca" },
    { href: "/mis-imagenes", icon: ImageIcon, label: t("nav.myImages"), group: "biblioteca", accent: "purple" },
    { href: "/mis-videos", icon: FileVideo, label: t("nav.myVideos"), group: "biblioteca", accent: "emerald" },
    { href: "/tienda", icon: ShoppingBag, label: t("nav.store"), group: "tienda", accent: "emerald" },
  ];
}

function Router() {
  const { user, logout, isSuperUser } = useAuth();
  const { t, i18n } = useTranslation();
  const navLinks = useNavLinks();
  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAdminAccess = () => {
    if (adminPwd === "Lara14032025#") {
      setIsAdminDialogOpen(false);
      window.location.href = "/admin";
    } else {
      alert("Contraseña de Superusuario Incorrecta.");
    }
  };

  const handleLogout = () => {
    logout();
  };

  const userInitials = user ? (user.name || user.email).slice(0, 2).toUpperCase() : "??";
  const userName = user?.name || user?.email?.split("@")[0] || "Usuario";
  const userPlan = user?.plan || "free";

  const getAccentClasses = (accent?: string) => {
    switch (accent) {
      case "blue": return "text-blue-300 hover:text-blue-200 hover:bg-blue-500/10";
      case "purple": return "text-purple-300 hover:text-purple-200 hover:bg-purple-500/10";
      case "emerald": return "text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10";
      default: return "text-slate-300 hover:text-white hover:bg-white/5";
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D17] text-slate-100 font-sans flex flex-col selection:bg-purple-500/30">
      <header className="border-b border-white/5 bg-[#0B0D17]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link href="/" className="flex items-center gap-3 group" data-testid="link-home">
              <img src="/logo-app.png" alt="Comic Crafter" className="w-8 h-8 rounded object-contain group-hover:scale-105 transition-transform" />
              <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:to-purple-200 transition-colors">
                Comic Crafter
              </span>
            </Link>

            {user && (
              <nav className="hidden xl:flex items-center gap-0.5">
                {navLinks.filter(l => l.group === "main").map(link => (
                  <Link key={link.href} href={link.href} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${getAccentClasses(link.accent)}`} data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    <link.icon className="w-4 h-4" /> {link.label}
                  </Link>
                ))}

                <div className="h-6 w-px bg-white/10 mx-1" />

                {navLinks.filter(l => l.group === "crear").map(link => (
                  <Link key={link.href} href={link.href} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${getAccentClasses(link.accent)}`} data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    <link.icon className="w-4 h-4" /> {link.label}
                  </Link>
                ))}

                <div className="h-6 w-px bg-white/10 mx-1" />

                <Link href="/tienda" className="px-3 py-2 rounded-md text-sm font-medium text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 flex items-center gap-2 transition-all" data-testid="link-tienda">
                  <ShoppingBag className="w-4 h-4" /> {t("nav.store")}
                </Link>

                <div className="h-6 w-px bg-white/10 mx-1" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all outline-none">
                      <ImageIcon className="w-4 h-4 text-purple-400" /> {t("nav.creations")} <ChevronDown className="w-3 h-3 text-white/40" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 bg-[#111322] border-white/10 text-white">
                    <DropdownMenuLabel className="text-xs text-white/50 uppercase tracking-wider">{t("nav.myCreations")}</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    {navLinks.filter(l => l.group === "biblioteca").map(link => (
                      <DropdownMenuItem key={link.href} className="focus:bg-white/5 cursor-pointer" asChild>
                        <Link href={link.href} className="flex items-center gap-2 w-full">
                          <link.icon className="w-4 h-4" /> {link.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  className="xl:hidden p-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  data-testid="button-mobile-menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:bg-white/5 px-3 py-2 rounded-lg transition-colors outline-none border border-white/5">
                      <span className="text-sm font-bold text-white">{currentLang.code.toUpperCase()}</span>
                      <ChevronDown className="w-3 h-3 text-white/50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 bg-[#111322] border-white/10 text-white">
                    <DropdownMenuLabel className="text-xs text-white/50 uppercase tracking-wider">{t("nav.language")}</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    {LANGUAGES.map(lang => (
                      <DropdownMenuItem key={lang.code} className="focus:bg-white/5 cursor-pointer flex justify-between" onClick={() => i18n.changeLanguage(lang.code)}>
                        <span>{lang.flag} {lang.name}</span>
                        {i18n.language === lang.code && <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 rounded">{t("nav.active")}</span>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Link href="/tienda" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-all" data-testid="badge-credits">
                  {isSuperUser ? (
                    <>
                      <Crown className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-xs font-bold text-yellow-300">Unlimited</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-xs font-bold text-yellow-300">{user?.credits || 0}</span>
                    </>
                  )}
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-purple-500/50" data-testid="button-user-menu">
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-bold text-white">{userName}</span>
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${isSuperUser ? 'text-yellow-400' : 'text-purple-400'}`}>{isSuperUser ? t("nav.superUser") : `${userPlan} ${t("nav.plan")}`}</span>
                      </div>
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={userName} className="w-10 h-10 rounded-full border-2 border-[#0B0D17] shadow-lg shadow-purple-500/20" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20 border-2 border-[#0B0D17]">
                          {userInitials}
                        </div>
                      )}
                      <ChevronDown className="w-4 h-4 text-white/50 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#111322] border-white/10 text-white">
                    <DropdownMenuLabel>{t("nav.myAccount")}</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="focus:bg-white/5 cursor-pointer">
                      {t("nav.profile")}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-white/5 cursor-pointer">
                      {t("nav.billing")}
                    </DropdownMenuItem>
                    {isSuperUser && (
                      <>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          className="focus:bg-red-500/20 text-red-400 focus:text-red-300 cursor-pointer flex items-center gap-2"
                          onClick={() => setIsAdminDialogOpen(true)}
                        >
                          <ShieldAlert className="w-4 h-4" /> {t("nav.adminPanel")}
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={handleLogout} className="focus:bg-white/5 text-slate-400 cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" /> {t("nav.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105" data-testid="button-login">
                  <LogOut className="w-4 h-4 rotate-180" /> {t("nav.login")}
                </button>
              </Link>
            )}
          </div>
        </div>

        {user && mobileMenuOpen && (
          <div className="xl:hidden border-t border-white/5 bg-[#0B0D17]/95 backdrop-blur-xl p-4 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              <p className="text-[10px] text-white/40 uppercase tracking-widest px-3 mb-2">{t("nav.tools")}</p>
              {navLinks.filter(l => l.group === "main" || l.group === "crear").map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2.5 rounded-md text-sm font-medium flex items-center gap-3 transition-all ${getAccentClasses(link.accent)}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="w-4 h-4" /> {link.label}
                </Link>
              ))}
              <div className="h-px bg-white/5 my-2" />
              <Link href="/tienda" className="block px-3 py-2.5 rounded-md text-sm font-medium flex items-center gap-3 transition-all text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10" onClick={() => setMobileMenuOpen(false)}>
                <ShoppingBag className="w-4 h-4" /> {t("nav.store")}
              </Link>
              <div className="h-px bg-white/5 my-2" />
              <p className="text-[10px] text-white/40 uppercase tracking-widest px-3 mb-2">{t("nav.library")}</p>
              {navLinks.filter(l => l.group === "biblioteca").map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2.5 rounded-md text-sm font-medium flex items-center gap-3 transition-all ${getAccentClasses(link.accent)}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="w-4 h-4" /> {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="fixed inset-0 pointer-events-none opacity-[0.02] mix-blend-screen z-0 bg-no-repeat bg-center bg-[length:50%]" style={{ backgroundImage: `url(${logoImg})` }}></div>

      <main className="flex-1 relative z-10 overflow-hidden">
        <Switch>
          <Route path="/privacidad" component={PrivacyPolicy} />
          <Route path="/terminos" component={TermsOfService} />
          <Route path="/aviso-legal" component={LegalNotice} />
          <Route path="/eliminar-cuenta" component={DeleteAccount} />
          <Route path="/" component={Hub} />
          <Route path="/login" component={Login} />
          <Route>
            <AuthWrapper>
              <Switch>
                <Route path="/story-weaver" component={StoryWeaver} />
                <Route path="/forge-3d" component={Forge3D} />
                <Route path="/voice" component={VoiceStudio} />
                
                <Route path="/video" component={CrearVideo} />
                <Route path="/personajes" component={Personajes} />
                <Route path="/crear-personaje" component={CrearPersonaje} />
                <Route path="/mis-imagenes" component={MisImagenes} />
                <Route path="/mis-videos" component={MisVideos} />
                <Route path="/mis-voces" component={MisVoces} />
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/tienda" component={Tienda} />
                <Route component={NotFound} />
              </Switch>
            </AuthWrapper>
          </Route>
        </Switch>
      </main>

      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className="bg-[#0f111a] border-red-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500 font-mono tracking-widest">
              <Lock className="w-5 h-5" /> {t("admin.authRequired", "AUTENTICACIÓN REQUERIDA")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-400 font-mono">{t("admin.restrictedAccess", "Acceso restringido solo para administradores del sistema.")}</p>
            <Input
              type="password"
              placeholder={t("admin.enterPin", "Introduce PIN Sudo...")}
              value={adminPwd}
              onChange={(e) => setAdminPwd(e.target.value)}
              className="bg-black/50 border-red-500/30 text-white font-mono"
              data-testid="input-admin-pin"
            />
            <Button onClick={handleAdminAccess} className="w-full bg-red-600 hover:bg-red-700 text-white font-mono tracking-widest" data-testid="button-admin-unlock">
              {t("admin.unlock", "DESBLOQUEAR SISTEMA")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
