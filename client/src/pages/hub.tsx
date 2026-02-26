import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Hammer, Mic2, Video, Zap, PenTool, Sparkles, Box, ChevronLeft, ChevronRight, ArrowRight, Star, Users, Image as ImageIcon, Palette } from "lucide-react";
import { Link } from "wouter";

const heroSlides = [
  { image: "/hero-bg-1.png", title: "Tu Universo Narrativo", subtitle: "cobra vida con IA" },
  { image: "/hero-bg-2.png", title: "Del Guion al Cómic", subtitle: "en minutos" },
  { image: "/hero-bg-3.png", title: "Estudio Creativo", subtitle: "del futuro" },
];

const features = [
  {
    icon: PenTool,
    image: "/feature-script.png",
    title: "Guiones Inteligentes",
    description: "La IA genera guiones cinematográficos completos con estructura de 3 actos, diálogos naturales y direcciones de arte. Elige género, tono y personajes.",
    color: "from-violet-500 to-purple-600",
    href: "/story-weaver",
  },
  {
    icon: ImageIcon,
    image: "/feature-characters.png",
    title: "Personajes Persistentes",
    description: "Crea personajes con apariencia consistente que la IA recuerda en cada escena. Sube fotos reales o genera desde cero con estilos manga, anime o western.",
    color: "from-pink-500 to-rose-600",
    href: "/crear-personaje",
  },
  {
    icon: Box,
    image: "/feature-3d.png",
    title: "Modelos 3D desde Texto",
    description: "Transforma descripciones o imágenes en modelos 3D listos para usar. Exporta en GLB para animación, juegos o impresión 3D.",
    color: "from-blue-500 to-cyan-600",
    href: "/forge-3d",
  },
  {
    icon: Mic2,
    image: "/feature-voice.png",
    title: "Voces IA Profesionales",
    description: "Más de 100 voces en 29 idiomas con ElevenLabs. Asigna voces únicas a cada personaje y genera diálogos narrados con calidad de estudio.",
    color: "from-emerald-500 to-teal-600",
    href: "/voice",
  },
  {
    icon: Video,
    image: "/feature-video.png",
    title: "Vídeo & Animación",
    description: "Un director IA te guía para crear cortos animados y vídeos. Combina guiones, personajes y voces en producciones cinematográficas.",
    color: "from-orange-500 to-amber-600",
    href: "/video",
  },
  {
    icon: Palette,
    image: "/feature-styles.png",
    title: "Múltiples Estilos",
    description: "Manga, anime, noir, fantasía oscura, western, chibi y más. Cada estilo se aplica con consistencia milimétrica en todas las viñetas de tu cómic.",
    color: "from-fuchsia-500 to-pink-600",
    href: "/story-weaver",
  },
];

export default function Hub() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <div className="min-h-screen">
      <section className="relative h-[85vh] overflow-hidden" data-testid="hero-carousel">
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D17]/80 to-transparent" />
          </div>
        ))}

        <div className="absolute inset-0 flex items-center z-10">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="flex items-center gap-3">
                <img src="/logo-icon.png" alt="ComicCrafter" className="w-14 h-14 rounded-2xl shadow-2xl shadow-purple-500/30 border-2 border-white/10" />
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-purple-400">ComicCrafter IA Stories</h2>
                  <p className="text-xs text-white/50">Plataforma de Creación con Inteligencia Artificial</p>
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1]">
                {heroSlides[currentSlide].title}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                  {heroSlides[currentSlide].subtitle}
                </span>
              </h1>

              <p className="text-lg text-white/60 leading-relaxed max-w-xl">
                Genera guiones, diseña personajes, crea modelos 3D, produce voces profesionales y monta vídeos animados. Todo con IA, todo en un solo lugar.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/story-weaver">
                  <Button className="h-14 px-8 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0 shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] transition-all rounded-full font-bold gap-2" data-testid="button-create-comic">
                    <Zap className="w-5 h-5" /> Crear mi Cómic
                  </Button>
                </Link>
                <Link href="/forge-3d">
                  <Button className="h-14 px-8 text-base bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white transition-all rounded-full font-bold gap-2" data-testid="button-create-3d">
                    <Hammer className="w-5 h-5" /> Modelo 3D
                  </Button>
                </Link>
                <Link href="/voice">
                  <Button className="h-14 px-8 text-base bg-white/5 hover:bg-white/15 backdrop-blur border border-white/10 text-white/80 transition-all rounded-full font-bold gap-2" data-testid="button-voices">
                    <Mic2 className="w-5 h-5" /> Voces IA
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center gap-4">
          <button
            onClick={() => { prevSlide(); setIsAutoPlaying(false); }}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white transition-all border border-white/10"
            data-testid="button-prev-slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentSlide(idx); setIsAutoPlaying(false); }}
                className={`h-2 rounded-full transition-all duration-500 ${idx === currentSlide ? "w-8 bg-purple-500" : "w-2 bg-white/30 hover:bg-white/50"}`}
                data-testid={`button-slide-${idx}`}
              />
            ))}
          </div>
          <button
            onClick={() => { nextSlide(); setIsAutoPlaying(false); }}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white transition-all border border-white/10"
            data-testid="button-next-slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section className="relative py-24 bg-gradient-to-b from-[#0B0D17] to-[#0f1225]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" /> Todas las herramientas que necesitas
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Un Estudio Completo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Creación con IA</span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Desde la idea inicial hasta la producción final. Cada herramienta potenciada por inteligencia artificial de última generación.
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
              { icon: Star, value: "100+", label: "Voces IA Disponibles" },
              { icon: Users, value: "29", label: "Idiomas Soportados" },
              { icon: Palette, value: "8+", label: "Estilos de Arte" },
              { icon: Sparkles, value: "6", label: "Herramientas IA" },
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
            Empieza a crear <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">ahora mismo</span>
          </h2>
          <p className="text-lg text-white/50">
            No necesitas experiencia previa. La IA se encarga de lo técnico, tú pones la creatividad.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/story-weaver">
              <Button className="h-14 px-10 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full font-bold shadow-[0_0_40px_rgba(168,85,247,0.3)] gap-2" data-testid="button-cta-start">
                <BookOpen className="w-5 h-5" /> Comenzar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#060812] border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="ComicCrafter" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-white/80">ComicCrafter IA Stories</span>
          </div>
          <p className="text-xs text-white/30">&copy; 2025-2026 ComicCrafter IA Stories. Powered by OpenAI, Gemini, Tripo3D, ElevenLabs.</p>
        </div>
      </footer>
    </div>
  );
}
