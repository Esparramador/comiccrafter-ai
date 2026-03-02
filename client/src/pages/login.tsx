import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useState, useEffect, useRef } from "react";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const { login, register, loginWithGoogle, user } = useAuth();

  useEffect(() => {
    if (user) window.location.href = "/";
  }, [user]);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initGoogle = () => {
      if (typeof google === "undefined" || !google.accounts) return false;

      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            setLoading(true);
            setError("");
            try {
              await loginWithGoogle(response.credential);
            } catch (err: any) {
              setError(err.message);
              setLoading(false);
            }
          },
          ux_mode: "popup",
        });

        if (googleButtonRef.current) {
          google.accounts.id.renderButton(googleButtonRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "pill",
            width: 380,
            logo_alignment: "left",
          });
          setGoogleReady(true);
        }
      } catch (e) {
        console.error("Google Sign-In init error:", e);
      }
      return true;
    };

    if (!initGoogle()) {
      const interval = setInterval(() => {
        if (initGoogle()) clearInterval(interval);
      }, 500);
      const timeout = setTimeout(() => clearInterval(interval), 5000);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }
  }, [loginWithGoogle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0D17] relative overflow-hidden animate-in fade-in duration-700">
      <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />

      <Card className="w-full max-w-[420px] bg-[#111322]/90 backdrop-blur-xl border-white/10 shadow-2xl relative z-10 overflow-hidden" data-testid="card-login">
        <div className="p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-3">
            <img src="/logo-app.png" alt="Comic Crafter" className="w-20 h-20 mx-auto rounded-2xl shadow-lg shadow-purple-500/20 border-2 border-white/5" />
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white" data-testid="text-app-title">
                {t("login.welcome")}
              </h1>
              <p className="text-white/40 text-sm mt-1">
                {mode === "login" ? t("login.signIn") : t("login.registerButton")}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl leading-relaxed" data-testid="text-auth-error">
              {error}
            </div>
          )}

          {clientId && (
            <div className="flex flex-col items-center">
              <div
                ref={googleButtonRef}
                className="w-full flex justify-center"
                data-testid="button-google-login"
              />
              {!googleReady && (
                <Button
                  disabled
                  className="w-full h-12 bg-white/10 text-white/40 font-medium rounded-xl text-sm"
                >
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t("login.loading")}
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs uppercase tracking-widest">{t("login.or")}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-xs text-white/50 font-medium mb-1.5 block">{t("login.name")}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="text"
                    placeholder={t("login.namePlaceholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 h-11 rounded-xl text-sm"
                    required
                    data-testid="input-name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-white/50 font-medium mb-1.5 block">{t("login.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="email"
                  placeholder={t("login.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 h-11 rounded-xl text-sm"
                  required
                  data-testid="input-email"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50 font-medium mb-1.5 block">{t("login.password")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder={t("login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 h-11 rounded-xl text-sm"
                  required
                  minLength={mode === "register" ? 6 : 1}
                  data-testid="input-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#1a1a2e] hover:bg-[#252545] text-white font-medium rounded-xl text-sm transition-all border border-white/10"
              data-testid="button-submit-auth"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "login" ? t("login.loginButton") : t("login.registerButton")}
            </Button>
          </form>

          <div className="flex items-center justify-between text-sm">
            {mode === "login" && (
              <span className="text-white/30 text-xs">{t("login.forgotPassword")}</span>
            )}
            <span className="text-white/40 text-xs ml-auto">
              {mode === "login" ? t("login.noAccount") + " " : t("login.hasAccount") + " "}
              <button
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                className="text-blue-400 hover:text-blue-300 font-semibold"
                data-testid={mode === "login" ? "button-switch-register" : "button-switch-login"}
              >
                {mode === "login" ? t("login.signUp") : t("login.signInLink")}
              </button>
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

declare const google: any;
