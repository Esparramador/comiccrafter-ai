import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ComicPageView({ pages, currentPage, setCurrentPage, coverUrl }) {
  const allPages = coverUrl 
    ? [{ page_number: 0, image_url: coverUrl, panel_descriptions: "Portada" }, ...pages]
    : pages;

  const page = allPages[currentPage];

  return (
    <div className="relative">
      {/* Page Display */}
      <div className="relative aspect-[2/3] max-h-[75vh] mx-auto bg-black/20 rounded-2xl overflow-hidden border border-white/5">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentPage}
            src={page?.image_url}
            alt={`Página ${page?.page_number}`}
            className="w-full h-full object-contain"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        {currentPage > 0 && (
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {currentPage < allPages.length - 1 && (
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Page Indicator */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <p className="text-sm text-gray-400">
          {currentPage === 0 && coverUrl ? "Portada" : `Página ${page?.page_number}`} de {pages.length}
        </p>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto py-4 px-2 mt-2">
        {allPages.map((p, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden border-2 transition-all ${
              i === currentPage
                ? "border-violet-500 shadow-lg shadow-violet-500/20"
                : "border-white/5 opacity-50 hover:opacity-80"
            }`}
          >
            <img src={p.image_url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}