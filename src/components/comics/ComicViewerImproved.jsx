import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import FlipbookViewer from "@/components/viewer/FlipbookViewer";
import InteractivePreviewPanel from "@/components/shared/InteractivePreviewPanel";

export default function ComicViewerImproved({ comic, onBack }) {
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [modifiedComic, setModifiedComic] = useState(comic);

  const handleModification = async (comments) => {
    try {
      const response = await base44.functions.invoke("modifyComic", {
        comic_id: comic.id,
        comments,
      });

      if (response.data?.updated_comic) {
        setModifiedComic(response.data.updated_comic);
      }
    } catch (error) {
      console.error("Error modifying comic:", error);
    }
  };

  const handleDownload = async () => {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const folder = zip.folder(modifiedComic.title);

      if (modifiedComic.cover_image_url) {
        const res = await fetch(modifiedComic.cover_image_url);
        const blob = await res.blob();
        folder.file("00_Portada.png", blob);
      }

      for (const page of modifiedComic.generated_pages || []) {
        const res = await fetch(page.image_url);
        const blob = await res.blob();
        folder.file(`Page_${String(page.page_number).padStart(2, "0")}.png`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = `${modifiedComic.title || "comic"}.zip`;
      a.click();
      URL.revokeObjectURL(zipUrl);
    } catch (error) {
      console.error("Error downloading comic:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="border-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">{modifiedComic.title}</h1>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowEditPanel(!showEditPanel)}
              variant="outline"
              className="border-violet-500/30 gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Editar
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-gradient-to-r from-violet-500 to-pink-500 gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Visor principal */}
          <div className="lg:col-span-2">
            <FlipbookViewer comic={modifiedComic} />
          </div>

          {/* Panel interactivo */}
          {showEditPanel && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 h-fit sticky top-20"
            >
              <InteractivePreviewPanel
                contentType="comic"
                contentData={modifiedComic}
                onApplyModification={handleModification}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}