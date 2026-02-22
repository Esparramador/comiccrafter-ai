import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, BookOpen, Loader2 } from "lucide-react";
import ComicPageView from "../components/viewer/ComicPageView";

export default function ComicViewer() {
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const comicId = urlParams.get("id");

  useEffect(() => {
    const loadComic = async () => {
      if (!comicId) { setLoading(false); return; }
      const comics = await base44.entities.ComicProject.list();
      const found = comics.find(c => c.id === comicId);
      setComic(found);
      setLoading(false);
    };
    loadComic();
  }, [comicId]);

  const handleDownload = async () => {
    if (!comic) return;
    setDownloading(true);

    // Download all images and create a downloadable package
    const pages = comic.generated_pages || [];
    
    // Download each image as a separate file
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const response = await fetch(page.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${comic.title}_pagina_${page.page_number}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }

    // Also download cover
    if (comic.cover_image_url) {
      const response = await fetch(comic.cover_image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${comic.title}_portada.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }

    setDownloading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <BookOpen className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Cómic no encontrado</h2>
        <p className="text-gray-400 mb-6">No se pudo encontrar el cómic solicitado.</p>
        <Link to={createPageUrl("MyComics")}>
          <Button variant="outline" className="border-white/10 text-gray-300 hover:text-white rounded-xl">
            Ver mis cómics
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("MyComics")}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{comic.title}</h1>
              <p className="text-xs text-gray-500">
                {comic.generated_pages?.length || 0} páginas · Estilo {comic.style}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={downloading}
              className="border-white/10 text-gray-300 hover:text-white rounded-xl gap-2"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Descargar</span>
            </Button>
          </div>
        </div>

        {/* Comic Pages */}
        <ComicPageView
          pages={comic.generated_pages || []}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          coverUrl={comic.cover_image_url}
        />
      </div>
    </div>
  );
}