import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useTranslation } from "react-i18next";
import { 
  Check, 
  Zap, 
  Crown, 
  Rocket, 
  CreditCard, 
  Clock, 
  Box, 
  Gamepad2, 
  Film, 
  BookOpen,
  Mail,
  Info,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  buttonText: string;
  popular?: boolean;
  color: string;
}

export default function Tienda() {
  const { t } = useTranslation();
  const [creditAmount, setCreditAmount] = useState([500]);
  
  const plans: Plan[] = [
    {
      id: "free",
      name: t("tienda.free"),
      price: "0€",
      period: t("tienda.freePeriod"),
      description: t("tienda.freeDesc"),
      features: [
        { text: t("tienda.freeCredits"), included: true },
        { text: t("tienda.freeImages"), included: true },
        { text: t("tienda.freeScripts"), included: true },
        { text: t("tienda.no3d"), included: false },
        { text: t("tienda.noVoices"), included: false },
      ],
      buttonText: t("tienda.currentPlan"),
      color: "slate",
    },
    {
      id: "pro",
      name: t("tienda.pro"),
      price: "14.99€",
      period: t("tienda.proPeriod"),
      description: t("tienda.proDesc"),
      popular: true,
      features: [
        { text: t("tienda.proCredits"), included: true },
        { text: t("tienda.proImages"), included: true },
        { text: t("tienda.proVideos"), included: true },
        { text: t("tienda.pro3d"), included: true },
        { text: t("tienda.proSupport"), included: true },
      ],
      buttonText: t("tienda.subscribe"),
      color: "purple",
    },
    {
      id: "enterprise",
      name: t("tienda.enterprise"),
      price: t("tienda.contact"),
      period: "",
      description: t("tienda.enterpriseDesc"),
      features: [
        { text: t("tienda.enterpriseCredits"), included: true },
        { text: t("tienda.enterpriseApi"), included: true },
        { text: t("tienda.enterpriseCustom"), included: true },
        { text: t("tienda.enterprisePriority"), included: true },
        { text: t("tienda.enterpriseAll"), included: true },
      ],
      buttonText: t("tienda.contact"),
      color: "blue",
    },
  ];

  const presetPacks = [
    { name: t("tienda.starter"), credits: 100, price: "5€", icon: Zap },
    { name: t("tienda.creator"), credits: 500, price: "22.50€", icon: Rocket, bestValue: true },
    { name: t("tienda.studio"), credits: 1000, price: "40€", icon: Crown },
  ];

  const services = [
    {
      title: t("credits.texture"), // Using existing keys where possible, or hub ones if they fit
      description: t("hub.feat3DModelsDesc"),
      image: "/services/3d-printing.png",
      tag: "Nuevo"
    },
    {
      title: "Assets para Videojuegos",
      description: "Modelos y texturas listos para tu motor.",
      image: "/services/videogames.png",
      tag: "Top"
    },
    {
      title: "Cine & Animación IA",
      description: "Producción cinematográfica con herramientas IA.",
      image: "/services/movies.png",
      tag: "Premium"
    },
    {
      title: "Cómics Personalizados",
      description: "Historias completas generadas por ti.",
      image: "/services/custom-comics.png",
      tag: "Populares",
      hasSubscribe: true
    },
  ];

  const calculateSliderPrice = (credits: number) => {
    return (credits * 0.045).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-[#0B0D17] text-white flex flex-col font-sans selection:bg-purple-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <Card className="bg-[#111322]/50 border-white/5 backdrop-blur-md p-6 sm:p-8 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4">
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-3 py-1">
                <Clock className="w-3.5 h-3.5 mr-2" /> Expira en 15 días
              </Badge>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-2">
                <p className="text-sm font-medium text-white/50 uppercase tracking-widest">{t("tienda.yourBalance")}</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-5xl font-black text-white tracking-tight">450 <span className="text-2xl font-normal text-white/40">{t("tienda.credits")}</span></h2>
                </div>
              </div>

              <div className="flex-1 max-w-md space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Uso mensual</span>
                  <span className="text-white/80 font-bold">450 / 1000</span>
                </div>
                <Progress value={45} className="h-2.5 bg-white/5" indicatorClassName="bg-gradient-to-r from-purple-600 to-blue-500" />
                <p className="text-[11px] text-white/30 italic text-right">Tu plan Pro se renueva el 12 de Marzo</p>
              </div>

              <Button className="bg-white text-black hover:bg-white/90 font-bold px-8 h-12 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5" data-testid="button-recharge-now">
                {t("tienda.buy")}
              </Button>
            </div>
          </Card>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{t("tienda.subscriptionPlans")}</h2>
            <p className="text-white/40 max-w-2xl mx-auto">{t("tienda.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative bg-[#111322]/40 border-white/5 backdrop-blur-sm p-8 rounded-3xl flex flex-col transition-all duration-300 hover:border-white/10 ${plan.popular ? 'ring-2 ring-purple-500/50 shadow-2xl shadow-purple-500/10 scale-105 z-20' : 'hover:translate-y-[-4px]'}`}
                data-testid={`card-plan-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-purple-600 hover:bg-purple-600 text-white font-bold px-4 py-1 rounded-full shadow-lg border-0">
                      {t("tienda.popular")}
                    </Badge>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-white/40 font-medium">{plan.period}</span>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed">{plan.description}</p>
                </div>

                <div className="space-y-4 flex-1 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      {feature.included ? (
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-green-500" />
                        </div>
                      ) : (
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        </div>
                      )}
                      <span className={feature.included ? 'text-white/80' : 'text-white/30'}>{feature.text}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full h-12 rounded-xl font-bold transition-all ${plan.id === 'pro' ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                  data-testid={`button-select-plan-${plan.id}`}
                >
                  {plan.buttonText}
                </Button>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{t("tienda.creditPacks")}</h2>
            <p className="text-white/40 max-w-2xl mx-auto">{t("tienda.creditPacksDesc")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <Card className="lg:col-span-2 bg-gradient-to-br from-[#111322]/80 to-[#0B0D17]/80 border-white/5 p-8 rounded-3xl space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shadow-inner">
                  <CreditCard className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Pack Personalizado</h3>
                  <p className="text-sm text-white/40 text-balance">Desliza para elegir la cantidad exacta que necesitas.</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-purple-500">Cantidad</span>
                    <p className="text-4xl font-black">{creditAmount[0]} <span className="text-lg font-normal text-white/30">{t("tienda.credits")}</span></p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-green-500">Precio</span>
                    <p className="text-4xl font-black text-green-400">{calculateSliderPrice(creditAmount[0])}€</p>
                  </div>
                </div>

                <div className="px-2">
                  <Slider
                    defaultValue={[500]}
                    max={5000}
                    min={100}
                    step={100}
                    onValueChange={setCreditAmount}
                    className="py-4 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase tracking-tighter mt-2">
                    <span>100 cr</span>
                    <span>1000 cr</span>
                    <span>2000 cr</span>
                    <span>3000 cr</span>
                    <span>4000 cr</span>
                    <span>5000 cr</span>
                  </div>
                </div>
              </div>

              <Button className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-purple-900/20 transition-all hover:scale-[1.01]" data-testid="button-buy-custom-credits">
                {t("tienda.buy")}
              </Button>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {presetPacks.map((pack, idx) => (
                <Card 
                  key={idx} 
                  className={`group bg-[#111322]/40 border-white/5 p-5 rounded-2xl flex items-center justify-between transition-all hover:border-purple-500/30 cursor-pointer ${pack.bestValue ? 'ring-1 ring-purple-500/30 bg-[#151829]' : ''}`}
                  data-testid={`card-preset-pack-${pack.name.toLowerCase()}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
                      <pack.icon className="w-5 h-5 text-white/40 group-hover:text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white/90">{pack.name}</h4>
                        {pack.bestValue && <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[9px] px-1.5 h-4 font-bold">{t("tienda.bestValue")}</Badge>}
                      </div>
                      <p className="text-xs text-white/40">{pack.credits} {t("tienda.credits")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl text-white group-hover:text-purple-400 transition-colors">{pack.price}</p>
                    <span className="text-[9px] text-white/20 font-bold uppercase">Pago único</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Catálogo de Servicios</h2>
              <p className="text-white/40 max-w-xl">Descubre todo lo que puedes crear y materializar con nuestra tecnología IA.</p>
            </div>
            <Button variant="link" className="text-purple-400 font-bold gap-2 group p-0 h-auto" data-testid="link-view-all-services">
              Ver todos <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <Card key={idx} className="group bg-[#111322]/40 border-white/5 rounded-3xl overflow-hidden flex flex-col hover:border-white/10 transition-all hover:translate-y-[-4px] h-full" data-testid={`card-service-${idx}`}>
                <div className="aspect-[4/5] relative overflow-hidden bg-black/40">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-transparent to-transparent opacity-60" />
                  <Badge className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border-white/10 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                    {service.tag}
                  </Badge>
                </div>
                
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-purple-400 transition-colors">{service.title}</h3>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{service.description}</p>
                  </div>

                  {service.hasSubscribe ? (
                    <Button className="w-full h-10 bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/20 font-bold rounded-xl transition-all" data-testid="button-subscribe-service">
                      {t("tienda.subscribe")}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold rounded-xl transition-all" data-testid={`button-info-service-${idx}`}>
                      Saber más
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-purple-500/10 transition-colors">
                <circle className="w-5 h-5 text-white/40 group-hover:text-purple-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Soporte 24/7</h4>
                <p className="text-[11px] text-white/30">Resolvemos tus dudas al instante.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-blue-500/10 transition-colors">
                <Box className="w-5 h-5 text-white/40 group-hover:text-blue-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Envío Asegurado</h4>
                <p className="text-[11px] text-white/30">Tus coleccionables llegan perfectos.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-green-500/10 transition-colors">
                <Info className="w-5 h-5 text-white/40 group-hover:text-green-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Garantía IA</h4>
                <p className="text-[11px] text-white/30">Calidad superior en cada generación.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="font-black text-sm tracking-tighter uppercase">Comic Crafter <span className="text-purple-500">Shop</span></span>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a href="#" className="text-xs font-bold text-white/30 hover:text-white transition-colors">{t("hub.footerContact")}</a>
            <a href="#" className="text-xs font-bold text-white/30 hover:text-white transition-colors">{t("hub.footerLegal")}</a>
            <a href="#" className="text-xs font-bold text-white/30 hover:text-white transition-colors">{t("hub.footerPrivacy")}</a>
          </div>
          <p className="text-[10px] text-white/20 font-medium">{t("hub.footerCopyright")}</p>
        </footer>
      </div>
    </div>
  );
}