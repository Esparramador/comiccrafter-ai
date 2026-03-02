import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Hammer, Mic2, Video, Zap, PenTool, Sparkles, Box, ChevronLeft, ChevronRight, ArrowRight, Star, Users, Image as ImageIcon, Palette } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

const galleryImages = [
  "/gallery/comic-banner.png",
  "/gallery/comic-cover.png",
  "/gallery/comic-cover-dark.png",
  "/gallery/comiccrafter-showcase.png",
  "/gallery/comic-wallpaper.png",
  "/gallery/feature-graphic.png",
  "/gallery/expanded-services.png",
  "/gallery/screenshot-create.png",
  "/gallery/screenshot-3d.png",
  "/gallery/screenshot-video.png",
  "/gallery/services-portfolio.png",
  "/gallery/service_3d_printing.png",
  "/gallery/service_custom_comics.png",
  "/gallery/service_movies.png",
  "/gallery/service_videogames.png",
];

export default function Hub() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [galleryOffset, setGalleryOffset] = useState(0);

  const features = [
    {
      icon: PenTool,
      image: "/feature-script.png",
      title: t("hub.featSmartScripts"),
      description: t("hub.featSmartScriptsDesc"),
      color: "from-violet-500 to-purple-600",
      href: "/story-weaver",
    },
    {
      icon: ImageIcon,
      image: "/feature-characters.png",
      title: t("hub.featPersistentChars"),
      description: t("hub.featPersistentCharsDesc"),
      color: "from-pink-500 to-rose-600",
      href: "/crear-personaje",
    },
    {
      icon: Box,
      image: "/feature-3d.png",
      title: t("hub.feat3DModels"),
      description: t("hub.feat3DModelsDesc"),
      color: "from-blue-500 to-cyan-600",
      href: "/forge-3d",
    },
    {
      icon: Mic2,
      image: "/feature-voice.png",
      title: t("hub.featVoices"),
      description: t("hub.featVoicesDesc"),
      color: "from-emerald-500 to-teal-600",
      href: "/voice",
    },
    {
      icon: Video,
      image: "/feature-video.png",
      title: t("hub.featVideo"),
      description: t("hub.featVideoDesc"),
      color: "from-orange-500 to-amber-600",
      href: "/video",
    },
    {
      icon: Palette,
      image: "/feature-styles.png",
      title: t("hub.featStyles"),
      description: t("hub.featStylesDesc"),
      color: "from-fuchsia-500 to-pink-600",
      href: "/story-weaver",
    },
  ];

  const heroTitles = [
    { title: t("hub.heroTitle1"), subtitle: t("hub.heroSub1") },
    { title: t("hub.heroTitle2"), subtitle: t("hub.heroSub2") },
    { title: t("hub.heroTitle3"), subtitle: t("hub.heroSub3") },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  useEffect(() => {
    const galleryInterval = setInterval(() => {
      setGalleryOffset((prev) => (prev + 1) % galleryImages.length);
    }, 3000);
    return () => clearInterval(galleryInterval);
  }, []);

  const visibleGallery = Array.from({ length: 8 }, (_, i) =>
    galleryImages[(galleryOffset + i) % galleryImages.length]
  );

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[90vh] overflow-hidden" data-testid="hero-carousel">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-1 opacity-[0.12]">
          {visibleGallery.map((img, idx) => (
            <div
              key={`${galleryOffset}-${idx}`}
              className="relative overflow-hidden animate-in fade-in duration-1000"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover scale-110 hover:scale-125 transition-transform duration-[3000ms]"
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D17]/70 via-[#0B0D17]/85 to-[#0B0D17]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D17]/90 via-transparent to-[#0B0D17]/90" />

        <div className="absolute inset-0 flex items-center z-10">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="flex items-center gap-3">
                <img src="/logo-app.png" alt="Comic Crafter" className="w-14 h-14 rounded-2xl shadow-2xl shadow-purple-500/30 border-2 border-white/10" />
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-purple-400">Comic Crafter IA Stories</h2>
                  <p className="text-xs text-white/50">{t("hub.subtitle")}</p>
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1]">
                {heroTitles[currentSlide].title}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                  {heroTitles[currentSlide].subtitle}
                </span>
              </h1>

              <p className="text-lg text-white/60 leading-relaxed max-w-xl">
                {t("hub.heroDescription")}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/story-weaver">
                  <Button className="h-14 px-8 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0 shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] transition-all rounded-full font-bold gap-2" data-testid="button-create-comic">
                    <Zap className="w-5 h-5" /> {t("hub.createComic")}
                  </Button>
                </Link>
                <Link href="/forge-3d">
                  <Button className="h-14 px-8 text-base bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white transition-all rounded-full font-bold gap-2" data-testid="button-create-3d">
                    <Hammer className="w-5 h-5" /> {t("hub.create3D")}
                  </Button>
                </Link>
                <Link href="/voice">
                  <Button className="h-14 px-8 text-base bg-white/5 hover:bg-white/15 backdrop-blur border border-white/10 text-white/80 transition-all rounded-full font-bold gap-2" data-testid="button-voices">
                    <Mic2 className="w-5 h-5" /> {t("hub.voicesAI")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + 3) % 3)}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white transition-all border border-white/10"
            data-testid="button-prev-slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {heroTitles.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${idx === currentSlide ? "w-8 bg-purple-500" : "w-2 bg-white/30 hover:bg-white/50"}`}
                data-testid={`button-slide-${idx}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white transition-all border border-white/10"
            data-testid="button-next-slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400 mb-2">{t("hub.galleryTitle", "Galería Dinámica")}</p>
            <h2 className="text-2xl font-black text-white">{t("hub.gallerySubtitle", "Creado con Comic Crafter")}</h2>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-[2000ms] ease-linear"
              style={{ transform: `translateX(-${(galleryOffset % galleryImages.length) * (100 / 5)}%)` }}
            >
              {[...galleryImages, ...galleryImages].map((img, idx) => (
                <div key={idx} className="w-1/5 shrink-0 px-1.5">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden border border-white/5 group">
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0B0D17] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0B0D17] to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-gradient-to-b from-[#0B0D17] to-[#0f1225]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" /> {t("hub.featuresTitle")}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Un Estudio Completo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Creación con IA</span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              {t("hub.featuresSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Link key={idx} href={feature.href}>
                <Card
                  className="group bg-[#111322]/80 border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] cursor-pointer h-full"
                  data-testid={`card-feature-${idx}`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111322] to-transparent" />
                    <div className={`absolute top-4 left-4 p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors flex items-center justify-between">
                      {feature.title}
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0f1225] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent_70%)]" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Star, value: "100+", label: t("hub.statVoices") },
              { icon: Users, value: "29", label: t("hub.statLanguages") },
              { icon: Palette, value: "8+", label: t("hub.statStyles") },
              { icon: Sparkles, value: "6", label: t("hub.statTools") },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-2" data-testid={`stat-${idx}`}>
                <stat.icon className="w-8 h-8 mx-auto text-purple-400" />
                <p className="text-4xl font-black text-white">{stat.value}</p>
                <p className="text-sm text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-[#0f1225] to-[#0B0D17]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-black text-white">
            {t("hub.ctaTitle")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{t("hub.ctaSub")}</span>
          </h2>
          <p className="text-lg text-white/50">
            {t("hub.ctaDescription")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/story-weaver">
              <Button className="h-14 px-10 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full font-bold shadow-[0_0_40px_rgba(168,85,247,0.3)] gap-2" data-testid="button-cta-start">
                <BookOpen className="w-5 h-5" /> {t("hub.ctaButton")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#060812] border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo-app.png" alt="Comic Crafter" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-white/80">Comic Crafter</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/privacidad"><span className="text-white/50 hover:text-purple-400 transition-colors cursor-pointer" data-testid="link-hub-privacy">{t("hub.footerPrivacy")}</span></Link>
            <Link href="/terminos"><span className="text-white/50 hover:text-purple-400 transition-colors cursor-pointer" data-testid="link-hub-terms">{t("hub.footerTerms")}</span></Link>
            <Link href="/aviso-legal"><span className="text-white/50 hover:text-purple-400 transition-colors cursor-pointer" data-testid="link-hub-legal">{t("hub.footerLegal")}</span></Link>
            <Link href="/eliminar-cuenta"><span className="text-white/50 hover:text-red-400 transition-colors cursor-pointer" data-testid="link-hub-delete">{t("hub.footerDelete")}</span></Link>
            <a href="mailto:sadiagiljoan@gmail.com" className="text-white/50 hover:text-purple-400 transition-colors" data-testid="link-hub-contact">{t("hub.footerContact")}</a>
          </div>
          <p className="text-xs text-white/30">{t("hub.footerCopyright")}</p>
        </div>
      </footer>
    </div>
  );
}
