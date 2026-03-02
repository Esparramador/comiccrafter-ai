import { Link, useLocation } from "wouter";
import { ArrowLeft, AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#0B0D17] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <span className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 cursor-pointer" data-testid="link-back-home">
            <ArrowLeft className="w-4 h-4" /> {t("legal.backToHome")}
          </span>
        </Link>
        <h1 className="text-3xl font-bold mt-6 mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent" data-testid="text-legal-title">{title}</h1>
        <div className="prose prose-invert prose-purple max-w-none space-y-6 text-slate-300 leading-relaxed">
          {children}
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Comic Crafter. {t("legal.copyright")}</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacidad"><span className="hover:text-purple-400 cursor-pointer" data-testid="link-footer-privacy">{t("legal.privacyTitle")}</span></Link>
            <Link href="/terminos"><span className="hover:text-purple-400 cursor-pointer" data-testid="link-footer-terms">{t("legal.termsTitle")}</span></Link>
            <Link href="/aviso-legal"><span className="hover:text-purple-400 cursor-pointer" data-testid="link-footer-legal">{t("legal.legalTitle")}</span></Link>
            <Link href="/eliminar-cuenta"><span className="hover:text-red-400 cursor-pointer" data-testid="link-footer-delete">{t("legal.deleteTitle")}</span></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicy() {
  const { t } = useTranslation();
  return (
    <LegalLayout title={t("legal.privacyTitle")}>
      <p><strong>{t("legal.lastUpdated")}:</strong> {new Date().toLocaleDateString(t("common.locale"), { year: "numeric", month: "long", day: "numeric" })}</p>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Responsable del Tratamiento</h2>
        <p>Comic Crafter ("nosotros", "la plataforma") es responsable del tratamiento de los datos personales recogidos a través de esta aplicación web y móvil.</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Correo de contacto: <a href="mailto:sadiagiljoan@gmail.com" className="text-purple-400">sadiagiljoan@gmail.com</a></li>
          <li>Sitio web: <a href="https://comiccrafter.es" className="text-purple-400">comiccrafter.es</a></li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. Datos que Recopilamos</h2>
        <p>Recopilamos los siguientes datos personales:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Datos de registro:</strong> nombre, dirección de correo electrónico, foto de perfil (si usas Google Sign-In).</li>
          <li><strong>Datos de uso:</strong> contenido generado (cómics, imágenes, modelos 3D, voces, vídeos), preferencias de la aplicación.</li>
          <li><strong>Datos técnicos:</strong> dirección IP, tipo de dispositivo, navegador, sistema operativo, datos de sesión.</li>
          <li><strong>Datos de pago:</strong> procesados de forma segura a través de Shopify Checkout. No almacenamos datos de tarjetas de crédito.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. Finalidad del Tratamiento</h2>
        <p>Utilizamos tus datos para:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Crear y gestionar tu cuenta de usuario.</li>
          <li>Proporcionar los servicios de generación de contenido con IA.</li>
          <li>Procesar pagos y gestionar suscripciones.</li>
          <li>Mejorar la plataforma y la experiencia de usuario.</li>
          <li>Comunicarnos contigo sobre actualizaciones y soporte.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Base Legal</h2>
        <p>El tratamiento de datos se basa en:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Consentimiento:</strong> al registrarte y aceptar estas condiciones.</li>
          <li><strong>Ejecución contractual:</strong> para proporcionar los servicios contratados.</li>
          <li><strong>Interés legítimo:</strong> para mejorar la seguridad y el funcionamiento de la plataforma.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Servicios de Terceros</h2>
        <p>Utilizamos los siguientes servicios de terceros que pueden procesar datos:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Google:</strong> autenticación (Google Sign-In), almacenamiento (Google Drive).</li>
          <li><strong>OpenAI / Google Gemini:</strong> generación de contenido con IA.</li>
          <li><strong>ElevenLabs:</strong> generación de voces.</li>
          <li><strong>Tripo3D:</strong> generación de modelos 3D.</li>
          <li><strong>Shopify:</strong> procesamiento de pagos y gestión de tienda.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Conservación de Datos</h2>
        <p>Conservamos tus datos mientras tu cuenta esté activa. Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento contactando a <a href="mailto:sadiagiljoan@gmail.com" className="text-purple-400">sadiagiljoan@gmail.com</a>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">7. Derechos del Usuario (RGPD)</h2>
        <p>Tienes derecho a:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Acceder a tus datos personales.</li>
          <li>Rectificar datos inexactos.</li>
          <li>Solicitar la supresión de tus datos.</li>
          <li>Oponerte al tratamiento.</li>
          <li>Portabilidad de tus datos.</li>
          <li>Presentar una reclamación ante la AEPD (Agencia Española de Protección de Datos).</li>
        </ul>
        <p>Para ejercer tus derechos, contacta a: <a href="mailto:sadiagiljoan@gmail.com" className="text-purple-400">sadiagiljoan@gmail.com</a></p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">8. Cookies</h2>
        <p>Utilizamos cookies técnicas necesarias para el funcionamiento de la aplicación (autenticación, sesión). No utilizamos cookies de seguimiento o publicidad de terceros.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">9. Seguridad</h2>
        <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos, incluyendo cifrado de contraseñas (bcrypt), conexiones HTTPS y tokens JWT seguros.</p>
      </section>
    </LegalLayout>
  );
}

export function TermsOfService() {
  const { t } = useTranslation();
  return (
    <LegalLayout title={t("legal.termsTitle")}>
      <p><strong>{t("legal.lastUpdated")}:</strong> {new Date().toLocaleDateString(t("common.locale"), { year: "numeric", month: "long", day: "numeric" })}</p>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Aceptación de las Condiciones</h2>
        <p>Al acceder y utilizar Comic Crafter, aceptas estas condiciones del servicio en su totalidad. Si no estás de acuerdo con alguna de estas condiciones, no debes utilizar la plataforma.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. Descripción del Servicio</h2>
        <p>Comic Crafter es una plataforma de creación de contenido potenciada por inteligencia artificial que permite:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Generar cómics, portadas y guiones con IA.</li>
          <li>Crear vídeos y cortos animados.</li>
          <li>Generar modelos 3D a partir de texto o imágenes.</li>
          <li>Crear voces y narración con IA.</li>
          <li>Diseñar y gestionar personajes.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. Registro y Cuenta</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Debes proporcionar información veraz al registrarte.</li>
          <li>Eres responsable de mantener la seguridad de tu cuenta.</li>
          <li>Debes ser mayor de 16 años para usar la plataforma.</li>
          <li>Una cuenta por persona. No se permite compartir credenciales.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Planes y Pagos</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Plan Gratuito:</strong> acceso limitado a funciones básicas con créditos limitados.</li>
          <li><strong>Plan Pro:</strong> acceso ampliado con más créditos y funciones avanzadas.</li>
          <li><strong>Plan Enterprise:</strong> acceso completo con soporte prioritario.</li>
          <li>Los pagos se procesan a través de Shopify Checkout de forma segura.</li>
          <li>Los créditos no utilizados no son reembolsables salvo lo que establezca la ley.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Propiedad del Contenido</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>El contenido que generes con la plataforma te pertenece.</li>
          <li>Nos concedes una licencia limitada para almacenar y procesar tu contenido mientras uses el servicio.</li>
          <li>No utilizaremos tu contenido para entrenar modelos de IA ni lo compartiremos con terceros sin tu consentimiento.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Uso Aceptable</h2>
        <p>No está permitido:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Generar contenido ilegal, ofensivo o que viole derechos de terceros.</li>
          <li>Intentar acceder sin autorización a cuentas de otros usuarios.</li>
          <li>Utilizar la plataforma para actividades fraudulentas.</li>
          <li>Revender el acceso a la plataforma sin autorización.</li>
          <li>Abusar de los sistemas de IA o intentar eludir los límites de uso.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">7. Limitación de Responsabilidad</h2>
        <p>Comic Crafter se proporciona "tal cual". No garantizamos que el servicio esté libre de errores o interrupciones. El contenido generado por IA puede contener inexactitudes. No nos hacemos responsables de daños directos o indirectos derivados del uso de la plataforma.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">8. Modificaciones</h2>
        <p>Nos reservamos el derecho de modificar estas condiciones. Te notificaremos de cambios significativos por correo electrónico o mediante aviso en la plataforma.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">9. Ley Aplicable</h2>
        <p>Estas condiciones se rigen por la legislación española y europea. Cualquier disputa será resuelta en los juzgados y tribunales de España.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">10. Contacto</h2>
        <p>Para cualquier consulta sobre estas condiciones, contacta a: <a href="mailto:sadiagiljoan@gmail.com" className="text-purple-400">sadiagiljoan@gmail.com</a></p>
      </section>
    </LegalLayout>
  );
}

export function LegalNotice() {
  const { t } = useTranslation();
  return (
    <LegalLayout title={t("legal.legalTitle")}>
      <p><strong>{t("legal.lastUpdated")}:</strong> {new Date().toLocaleDateString(t("common.locale"), { year: "numeric", month: "long", day: "numeric" })}</p>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Datos Identificativos</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Nombre comercial:</strong> Comic Crafter</li>
          <li><strong>Sitio web:</strong> <a href="https://comiccrafter.es" className="text-purple-400">comiccrafter.es</a></li>
          <li><strong>Correo electrónico:</strong> <a href="mailto:sadiagiljoan@gmail.com" className="text-purple-400">sadiagiljoan@gmail.com</a></li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. Objeto</h2>
        <p>Este sitio web y aplicación tienen como objeto proporcionar servicios de creación de contenido digital mediante inteligencia artificial, incluyendo cómics, modelos 3D, vídeos animados y voces sintéticas.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. Propiedad Intelectual</h2>
        <p>Todos los elementos de la plataforma (diseño, código fuente, logotipos, textos, gráficos) son propiedad de Comic Crafter o se utilizan bajo licencia. Queda prohibida su reproducción sin autorización expresa.</p>
        <p>El contenido generado por los usuarios mediante las herramientas de IA pertenece a los propios usuarios, sujeto a las condiciones de uso de los proveedores de IA subyacentes.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Responsabilidad</h2>
        <p>Comic Crafter no se hace responsable de:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>La calidad o precisión del contenido generado por IA.</li>
          <li>Interrupciones del servicio por causas técnicas o de fuerza mayor.</li>
          <li>El uso que los usuarios hagan del contenido generado.</li>
          <li>El contenido de sitios web de terceros enlazados desde la plataforma.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Legislación Aplicable</h2>
        <p>Este aviso legal se rige por la legislación española, en particular:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI).</li>
          <li>Reglamento General de Protección de Datos (RGPD).</li>
          <li>Ley Orgánica 3/2018 de Protección de Datos y Garantía de Derechos Digitales (LOPDGDD).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Contacto</h2>
        <p>Para cualquier cuestión legal relacionada con la plataforma, puedes contactar a: <a href="mailto:sadiagiljoan@gmail.com" className="text-purple-400">sadiagiljoan@gmail.com</a></p>
      </section>
    </LegalLayout>
  );
}

export function DeleteAccount() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [step, setStep] = useState<"info" | "confirm">("info");

  const handleDelete = async () => {
    if (confirmText !== t("legal.confirmDeleteText")) {
      toast({ title: t("legal.incorrectText"), description: t("legal.incorrectTextHelp", { text: t("legal.confirmDeleteText") }), variant: "destructive" });
      return;
    }
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("cc_token");
      if (!token) {
        toast({ title: t("legal.notLoggedIn"), description: t("legal.notLoggedInHelp"), variant: "destructive" });
        setIsDeleting(false);
        return;
      }
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ confirmEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("legal.deleteError"));
      localStorage.removeItem("cc_token");
      localStorage.removeItem("cc_user");
      toast({ title: t("legal.accountDeleted"), description: t("legal.accountDeletedHelp") });
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <LegalLayout title={t("legal.deleteTitle")}>
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-red-400 mb-2">{t("legal.importantNotice")}</h3>
            <p className="text-sm text-slate-300">{t("legal.importantNoticeDesc")}</p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">{t("legal.whatIsDeleted")}</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t("legal.deletedItem1")}</li>
          <li>{t("legal.deletedItem2")}</li>
          <li>{t("legal.deletedItem3")}</li>
          <li>{t("legal.deletedItem4")}</li>
          <li>{t("legal.deletedItem5")}</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">{t("legal.whatIsNotDeleted")}</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t("legal.notDeletedItem1")}</li>
          <li>{t("legal.notDeletedItem2")}</li>
          <li>{t("legal.notDeletedItem3")}</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">{t("legal.alternatives")}</h2>
        <p>{t("legal.alternativesDesc")}</p>
      </section>

      {step === "info" && (
        <div className="mt-10 pt-8 border-t border-white/10">
          <button
            onClick={() => setStep("confirm")}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-lg transition-all flex items-center gap-2"
            data-testid="button-start-delete"
          >
            <Trash2 className="w-4 h-4" /> {t("legal.wantToDelete")}
          </button>
        </div>
      )}

      {step === "confirm" && (
        <div className="mt-10 pt-8 border-t border-red-500/30 space-y-6">
          <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-400">{t("legal.confirmDeleteTitle")}</h3>
            <p className="text-sm text-slate-300">{t("legal.confirmDeleteDesc", { text: t("legal.confirmDeleteText") })}</p>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">{t("legal.yourEmail")}</label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-black/50 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:ring-red-500 focus:border-red-500"
                data-testid="input-confirm-email"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">{t("legal.confirmTextPrompt", { text: t("legal.confirmDeleteText") })}</label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={t("legal.confirmDeleteText")}
                className="w-full bg-black/50 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:ring-red-500 focus:border-red-500"
                data-testid="input-confirm-text"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep("info")}
                className="px-5 py-3 rounded-lg border border-white/10 text-white/60 hover:text-white text-sm font-medium transition-all"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || confirmText !== t("legal.confirmDeleteText") || !confirmEmail}
                className="bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 disabled:text-white/30 text-white font-bold px-6 py-3 rounded-lg transition-all flex items-center gap-2 text-sm"
                data-testid="button-confirm-delete"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? t("common.loading") : t("legal.deletePermanently")}
              </button>
            </div>
          </div>
        </div>
      )}
    </LegalLayout>
  );
}
