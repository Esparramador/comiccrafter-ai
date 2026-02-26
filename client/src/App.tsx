import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Hub from "./pages/hub";
import StoryWeaver from "./pages/story-weaver";
import Forge3D from "./pages/forge-3d";
import VoiceStudio from "./pages/voice-studio";
import AdminLogin from "./pages/admin-login";
import AdminDashboard from "./pages/admin-dashboard";
import Personajes from "./pages/personajes";
import CrearVideo from "./pages/crear-video";
import MisVideos from "./pages/mis-videos";
import MisImagenes from "./pages/mis-imagenes";
import MisVoces from "./pages/mis-voces";
import Login from "./pages/login";

import CrearPersonaje from "./pages/crear-personaje";

import { Home, Sparkles, BookOpen, Video, Users, LogOut, ChevronDown, Lock, ShieldAlert, Image as ImageIcon, FileVideo, Mic2, Hammer, Wand2, Menu, X } from "lucide-react";
import { Button } from "./components/ui/button";
import { useState, useEffect } from "react";
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

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const logged = localStorage.getItem('isLogged');
    if (logged === 'true') {
      setIsLogged(true);
    }
  }, []);

  if (!isLogged) {
    return <Login />;
  }

  return <>{children}</>;
}

const navLinks = [
  { href: "/", icon: Home, label: "Inicio", group: "main" },
  { href: "/story-weaver", icon: BookOpen, label: "Portadas & Guiones", group: "crear" },
  { href: "/video", icon: Video, label: "Vídeo / Cortos", group: "crear" },
  { href: "/forge-3d", icon: Hammer, label: "Modelos 3D", group: "crear" },
  { href: "/voice", icon: Mic2, label: "Voces IA", group: "crear", accent: "emerald" },
  { href: "/crear-personaje", icon: Wand2, label: "Crear Personaje", group: "crear", accent: "blue" },
  { href: "/personajes", icon: Users, label: "Mis Personajes", group: "biblioteca" },
  { href: "/mis-imagenes", icon: ImageIcon, label: "Mis Imágenes", group: "biblioteca", accent: "purple" },
  { href: "/mis-videos", icon: FileVideo, label: "Mis Vídeos", group: "biblioteca", accent: "emerald" },
];

function Router() {
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAdminAccess = () => {
    if (adminPwd === "14032025") {
      setIsAdminDialogOpen(false);
      window.location.href = "/admin";
    } else {
      alert("Contraseña de Superusuario Incorrecta.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLogged');
    window.location.reload();
  };

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
              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:to-purple-200 transition-colors">
                ComicCrafter
              </span>
            </Link>

            <nav className="hidden xl:flex items-center gap-0.5">
              {navLinks.filter(l => l.group === "main").map(link => (
                <Link key={link.href} href={link.href} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${getAccentClasses(link.accent)}`} data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <link.icon className="w-4 h-4" /> {link.label}
                </Link>
              ))}

              <div className="h-6 w-px bg-white/10 mx-1" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all outline-none">
                    <Sparkles className="w-4 h-4 text-blue-400" /> Crear <ChevronDown className="w-3 h-3 text-white/40" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 bg-[#111322] border-white/10 text-white">
                  <DropdownMenuLabel className="text-xs text-white/50 uppercase tracking-wider">Herramientas IA</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {navLinks.filter(l => l.group === "crear").map(link => (
                    <DropdownMenuItem key={link.href} className="focus:bg-white/5 cursor-pointer" asChild>
                      <Link href={link.href} className="flex items-center gap-2 w-full">
                        <link.icon className="w-4 h-4" /> {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all outline-none">
                    <ImageIcon className="w-4 h-4 text-purple-400" /> Biblioteca <ChevronDown className="w-3 h-3 text-white/40" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-[#111322] border-white/10 text-white">
                  <DropdownMenuLabel className="text-xs text-white/50 uppercase tracking-wider">Mis Creaciones</DropdownMenuLabel>
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
          </div>

          <div className="flex items-center gap-3">
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
                  <span className="text-sm font-bold text-white">ES</span>
                  <ChevronDown className="w-3 h-3 text-white/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-[#111322] border-white/10 text-white">
                <DropdownMenuLabel className="text-xs text-white/50 uppercase tracking-wider">Idioma de la App</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="focus:bg-white/5 cursor-pointer flex justify-between">
                  Español <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 rounded">Activo</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/5 cursor-pointer">English</DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/5 cursor-pointer">日本語 (Japonés)</DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/5 cursor-pointer">Français</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-purple-500/50" data-testid="button-user-menu">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-bold text-white">sadiagiljoan</span>
                    <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">Pro Plan</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20 border-2 border-[#0B0D17]">
                    JS
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/50 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#111322] border-white/10 text-white">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="focus:bg-white/5 cursor-pointer">
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/5 cursor-pointer">
                  Ajustes de Facturación
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="focus:bg-red-500/20 text-red-400 focus:text-red-300 cursor-pointer flex items-center gap-2"
                  onClick={() => setIsAdminDialogOpen(true)}
                >
                  <ShieldAlert className="w-4 h-4" /> Sudo Admin Panel
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleLogout} className="focus:bg-white/5 text-slate-400 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-white/5 bg-[#0B0D17]/95 backdrop-blur-xl p-4 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              <p className="text-[10px] text-white/40 uppercase tracking-widest px-3 mb-2">Herramientas</p>
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
              <p className="text-[10px] text-white/40 uppercase tracking-widest px-3 mb-2">Biblioteca</p>
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
        <AuthWrapper>
          <Switch>
            <Route path="/" component={Hub} />
            <Route path="/login" component={Login} />
            <Route path="/story-weaver" component={StoryWeaver} />
            <Route path="/forge-3d" component={Forge3D} />
            <Route path="/voice" component={VoiceStudio} />
            <Route path="/admin-login" component={AdminLogin} />
            <Route path="/video" component={CrearVideo} />
            <Route path="/personajes" component={Personajes} />
            <Route path="/crear-personaje" component={CrearPersonaje} />
            <Route path="/mis-imagenes" component={MisImagenes} />
            <Route path="/mis-videos" component={MisVideos} />
            <Route path="/mis-voces" component={MisVoces} />
            <Route path="/admin" component={AdminDashboard} />
            <Route component={NotFound} />
          </Switch>
        </AuthWrapper>
      </main>

      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className="bg-[#0f111a] border-red-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500 font-mono tracking-widest">
              <Lock className="w-5 h-5" /> AUTENTICACIÓN REQUERIDA
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-400 font-mono">Acceso restringido solo para administradores del sistema (sadiagiljoan).</p>
            <Input
              type="password"
              placeholder="Introduce PIN Sudo..."
              value={adminPwd}
              onChange={(e) => setAdminPwd(e.target.value)}
              className="bg-black/50 border-red-500/30 text-white font-mono"
              data-testid="input-admin-pin"
            />
            <Button onClick={handleAdminAccess} className="w-full bg-red-600 hover:bg-red-700 text-white font-mono tracking-widest" data-testid="button-admin-unlock">
              DESBLOQUEAR SISTEMA
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
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
