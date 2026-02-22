import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X, Grid3X3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageEnhancer from "./ImageEnhancer";

export default function FlipbookViewer({ pages, coverUrl }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [direction, setDirection] = useState(1);
  const [showEnhancer, setShowEnhancer] = useState(false);

  const allPages = coverUrl
    ? [{ page_number: 0, image_url: coverUrl, panel_descriptions: "Portada", panels: [] }, ...pages]
    : pages;

  const goTo = useCallback((idx) => {
    setDirection(idx > currentPage ? 1 : -1);
    setCurrentPage(idx);
    setShowGrid(false);
  }, [currentPage]);

  const prev = () => { if (currentPage > 0) goTo(currentPage - 1); };
  const next = () => { if (currentPage < allPages.length - 1) goTo(currentPage + 1); };

  const page = allPages[currentPage];
  const isFirst = currentPage === 0;
  const isLast = currentPage === allPages.length - 1;

  const pageLabel = currentPage === 0 && coverUrl
    ? "Portada"
    : `Página ${page?.page_number}`;

  const variants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 60 : -60, scale: 0.97 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -60 : 60, scale: 0.97 }),
  };

  const Wrapper = fullscreen
    ? ({ children }) => (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          {children}
          <button onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>
      )
    : ({ children }) => <div className="relative">{children}</div>;

  return (
    <Wrapper>
      {/* Grid overlay */}
      <AnimatePresence>
        {showGrid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-6"
            onClick={() => setShowGrid(false)}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              {allPages.map((p, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`relative aspect-[2/3] rounded-xl overflow-hidden border-2 transition-all ${
                    i === currentPage ? "border-violet-500" : "border-white/10 hover:border-white/30"
                  }`}>
                  <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 py-1 bg-black/70 text-center text-[10px] text-gray-300">
                    {i === 0 && coverUrl ? "Portada" : `P.${p.page_number}`}
                  </div>
                </button>
              ))}
            </div>
            <Button variant="outline" className="mt-6 border-white/20 text-gray-300" onClick={() => setShowGrid(false)}>
              <X className="w-4 h-4 mr-2" /> Cerrar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page */}
      <div className={`relative overflow-hidden rounded-2xl bg-[#0d0d14] border border-white/5 shadow-2xl ${
        fullscreen ? "w-full max-w-lg mx-auto" : ""
      }`}
        style={{ aspectRatio: "2/3", maxHeight: fullscreen ? "85vh" : "72vh" }}
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.img
            key={currentPage}
            src={page?.image_url}
            alt={pageLabel}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="w-full h-full object-contain"
          />
        </AnimatePresence>

        {/* Side nav */}
        {!isFirst && (
          <button onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {!isLast && (
          <button onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Top bar */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-gray-300">
            {pageLabel} / {pages.length}
          </span>
          <div className="flex gap-1.5">
            <button onClick={() => setShowEnhancer(true)}
              title="Mejorar imagen"
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-gray-300 hover:text-violet-300 transition-colors">
              <Sparkles className="w-4 h-4" />
            </button>
            <button onClick={() => setShowGrid(true)}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-gray-300 hover:text-white transition-colors">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setFullscreen(!fullscreen)}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-gray-300 hover:text-white transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Panel description tooltip */}
        {page?.panel_descriptions && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
            <p className="text-[11px] text-gray-400 line-clamp-2">{page.panel_descriptions}</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
          animate={{ width: `${((currentPage + 1) / allPages.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Thumbnails strip */}
      <div className="flex gap-1.5 overflow-x-auto py-3 mt-1 px-1 scrollbar-hide">
        {allPages.map((p, i) => (
          <button key={i} onClick={() => goTo(i)}
            className={`flex-shrink-0 w-14 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              i === currentPage
                ? "border-violet-500 shadow-lg shadow-violet-500/20 opacity-100"
                : "border-white/5 opacity-40 hover:opacity-70"
            }`}>
            <img src={p.image_url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-[11px] text-gray-600 mt-1">
        ← → para navinar · 🔲 ver todas · ⛶ pantalla completa
      </p>
    </Wrapper>
  );
}