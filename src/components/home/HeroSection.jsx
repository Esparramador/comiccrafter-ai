import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Sparkles, ArrowRight, Zap, Pyramid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLang } from "@/components/i18n/i18n";

export default function HeroSection() {
  const { t } = useLang();
  const h = t.hero;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Link to={createPageUrl("CreateComic")}>
                <Button className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 transition-all rounded-xl gap-2">
                  <Zap className="w-5 h-5" />
                  {h.cta1}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Link to={createPageUrl("Create3DModel")}>
                <Button className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 transition-all rounded-xl gap-2">
                  <Pyramid className="w-5 h-5" />
                  Crear Modelo 3D
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
          { icon: "📸", title: h.f1title, desc: h.f1desc },
          { icon: "✍️", title: h.f2title, desc: h.f2desc },
          { icon: "🎨", title: h.f3title, desc: h.f3desc }].
          map((f, i) =>
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
            whileHover={{ translateY: -4, borderColor: "rgba(139, 92, 246, 0.3)" }}
            className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-violet-500/20 transition-all duration-300 cursor-default">

              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}