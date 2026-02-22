import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Loader2, Edit3, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FlipbookViewer from "../components/viewer/FlipbookViewer";
import ExportPanel from "../components/viewer/ExportPanel";

export default function ComicViewer() {
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const comicId = urlParams.get("id");

  useEffect(() => {
    const loadComic = async () => {
      if (!comicId) { setLoading(false); return; }
      const comics = await base44.entities.ComicProject.list();
      setComic(comics.find(c => c.id === comicId) || null);
      setLoading(false);
    };
    loadComic();
  }, [comicId]);

  const handlePageSave = async (updatedPage, pageIndex) => {
    setSaving(true);
    const isCover = pageIndex === 0 && !!comic.cover_image_url;
    let updatedComic;
    if (isCover) {
      updatedComic = { ...comic, cover_image_url: updatedPage.image_url };
    } else {
      const newPages = (comic.generated_pages || []).map(p =>
        p.page_number === updatedPage.page_number ? updatedPage : p
      );
      updatedComic = { ...comic, generated_pages: newPages };
    }
    await base44.entities.ComicProject.update(comic.id, updatedComic);
    setComic(updatedComic);
    setSaving(false);
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("MyComics")}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{comic.title}</h1>
              <p className="text-xs text-gray-500">
                {comic.generated_pages?.length || 0} páginas · {comic.style}
                {saving && <span className="ml-2 text-violet-400">Guardando...</span>}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(createPageUrl("MyComics"))}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Layout: viewer + sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Flipbook */}
          <div className="flex-1 min-w-0">
            <FlipbookViewer
              pages={comic.generated_pages || []}
              coverUrl={comic.cover_image_url}
              onPageSave={handlePageSave}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 space-y-4 flex-shrink-0">
            <ExportPanel comic={comic} />

            {/* Story excerpt */}
            <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-white mb-2">Historia</h3>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-6">{comic.story}</p>
            </div>

            {/* Characters */}
            {comic.character_descriptions?.length > 0 && (
              <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
                <h3 className="text-sm font-semibold text-white mb-3">Personajes</h3>
                <div className="space-y-3">
                  {comic.character_descriptions.filter(c => c.name).map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {c.photo_url
                        ? <img src={c.photo_url} className="w-9 h-9 rounded-full object-cover border border-white/10" alt={c.name} />
                        : <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 text-sm font-bold">{c.name[0]}</div>
                      }
                      <div>
                        <p className="text-xs font-semibold text-white">{c.name}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{c.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}