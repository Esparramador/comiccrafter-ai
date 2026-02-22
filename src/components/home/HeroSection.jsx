import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Sparkles, ArrowRight, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/40 via-[#0a0a0f] to-[#0a0a0f]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-600/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-[80px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Motor de IA Generativa para Cómics · Comic Crafter
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            <span className="text-white">Convierte tus</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              historias en cómics
            </span>
            <br />
            <span className="text-white">con IA</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Sube tus fotos, cuenta tu historia y deja que nuestra IA genere un cómic 
            profesional con estilo anime, manga o el que prefieras. Páginas completas 
            con paneles, diálogos y arte impresionante.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link to={createPageUrl("CreateComic")}>
              <Button className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 transition-all rounded-xl gap-2">
                <Zap className="w-5 h-5" />
                Crear mi Cómic
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to={createPageUrl("MyComics")}>
              <Button variant="outline" className="h-14 px-8 text-base font-semibold border-white/10 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl gap-2">
                <BookOpen className="w-5 h-5" />
                Ver mis Cómics
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
        >
          {[
            { icon: "📸", title: "Sube Fotos", desc: "Sube fotos reales y la IA creará personajes basados en ellas" },
            { icon: "✍️", title: "Cuenta tu Historia", desc: "Escribe la trama y la IA genera guion, diálogos y paneles" },
            { icon: "🎨", title: "Arte Profesional", desc: "Elige entre estilos manga, anime, noir, fantasía y más" },
          ].map((f, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-violet-500/20 transition-all duration-300"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}