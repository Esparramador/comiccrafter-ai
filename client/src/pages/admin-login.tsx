import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, ShieldAlert, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "14032025") {
      toast({
        title: "Acceso Root Concedido",
        description: "Bienvenido al panel de control maestro, sadiagiljoan.",
      });
      setLocation("/admin");
    } else {
      toast({
        variant: "destructive",
        title: "Acceso Denegado",
        description: "Contraseña incorrecta. Intento registrado.",
      });
      setPassword("");
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-4 bg-black animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden font-mono">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      
      <Card className="w-full max-w-md bg-black/90 border-green-500/30 p-8 shadow-[0_0_50px_rgba(0,255,0,0.1)] relative z-10">
        <div className="flex flex-col items-center text-center space-y-6 mb-8">
          <div className="w-16 h-16 bg-green-500/10 rounded-sm flex items-center justify-center border border-green-500/50 shadow-[0_0_15px_rgba(0,255,0,0.2)]">
            <Terminal className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-green-400 mb-2 uppercase tracking-widest">Sudo Access</h1>
            <p className="text-xs text-green-400/50">sadiagiljoan@gmail.com</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-3 text-green-500/50">&gt;_</span>
              <Input 
                type="password" 
                placeholder="ENTER_ROOT_PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-black border-green-500/30 h-12 text-green-400 placeholder:text-green-500/30 focus-visible:ring-green-500 focus-visible:border-green-500 font-mono rounded-sm"
                autoFocus
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full h-12 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/50 font-medium group rounded-sm uppercase tracking-widest">
            Execute Auth
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>
      </Card>
    </div>
  );
}