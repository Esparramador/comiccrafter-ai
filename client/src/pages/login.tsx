import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    localStorage.setItem("isLogged", "true");
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0D17] relative overflow-hidden animate-in fade-in duration-1000">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.apply/noise.svg')] opacity-5 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none" />

      <Card className="w-full max-w-md bg-[#111322]/80 backdrop-blur-xl border-white/10 p-10 shadow-2xl relative z-10 text-center">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#00E5FF] to-[#0077FF] bg-clip-text text-transparent mb-4">ComicCrafter</h1>
          <p className="text-white/60 text-sm">
            Tus historias, personajes y contenido multimedia, sincronizados de forma segura con tu cuenta de Google.
          </p>
        </div>

        <Button 
          onClick={handleLogin}
          className="w-full h-14 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </Button>

        <p className="mt-8 text-xs text-white/40">
          Al iniciar sesión, garantizamos que tus creaciones sean únicas, intransferibles y estén ligadas exclusivamente a tu cuenta.
        </p>
      </Card>
    </div>
  );
}