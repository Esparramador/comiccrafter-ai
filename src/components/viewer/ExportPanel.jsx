import React, { useState } from "react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Download, FileImage, FolderOpen, Loader2, CheckCircle2, FileText } from "lucide-react";

export default function ExportPanel({ comic }) {
  const [zipLoading, setZipLoading] = useState(false);
  const [indivLoading, setIndivLoading] = useState(false);
  const [done, setDone] = useState(null); // "zip" | "indiv" | "script"

  const buildScriptText = () => {
    const pages = comic.generated_pages || [];
    let text = `${comic.title}\n${"=".repeat((comic.title || "").length)}\n`;
    text += `\nHistoria: ${comic.story || ""}\n`;
    text += `\nEstilo: ${comic.style || ""} · Páginas: ${pages.length}\n`;
    text += `\n${"─".repeat(50)}\n\n`;
    pages.forEach(p => {
      text += `PÁGINA ${p.page_number}${p.act ? ` (Acto ${p.act})` : ""}\n`;
      text += `${"─".repeat(30)}\n`;
      if (p.page_summary) text += `Resumen: ${p.page_summary}\n\n`;
      if (p.panel_descriptions) text += `Descripción de paneles:\n${p.panel_descriptions}\n\n`;
      if (p.dialogues) text += `Diálogos:\n${p.dialogues}\n`;
      text += `\n`;
    });
    return text;
  };

  const downloadScript = () => {
    const text = buildScriptText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${comic.title || "comic"}_guion.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDone("script");
    setTimeout(() => setDone(null), 3000);
  };

  const allImages = [
    ...(comic.cover_image_url
      ? [{ url: comic.cover_image_url, name: "00_Portada.png" }]
      : []),
    ...(comic.generated_pages || []).map(p => ({
      url: p.image_url,
      name: `Pag_${String(p.page_number).padStart(2, "0")}.png`,
    })),
  ];

  const fetchBlob = async (url) => {
    const res = await fetch(url);
    return res.blob();
  };

  const downloadZip = async () => {
    setZipLoading(true);
    setDone(null);
    const zip = new JSZip();
    const folder = zip.folder(comic.title || "comic");

    for (const img of allImages) {
      const blob = await fetchBlob(img.url);
      folder.file(img.name, blob);
    }

    // Add a text file with panel descriptions
    let scriptText = `${comic.title}\n${"=".repeat(comic.title?.length || 10)}\n\n`;
    (comic.generated_pages || []).forEach(p => {
      scriptText += `--- Página ${p.page_number} ---\n${p.panel_descriptions || ""}\n\n`;
    });
    folder.file("guion.txt", scriptText);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${comic.title || "comic"}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setZipLoading(false);
    setDone("zip");
    setTimeout(() => setDone(null), 3000);
  };

  const downloadIndividual = async () => {
    setIndivLoading(true);
    setDone(null);
    for (const img of allImages) {
      const blob = await fetchBlob(img.url);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = img.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      await new Promise(r => setTimeout(r, 300));
    }
    setIndivLoading(false);
    setDone("indiv");
    setTimeout(() => setDone(null), 3000);
  };

  return (
    <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-3">
      <h3 className="text-sm font-semibold text-white mb-1">Exportar Cómic</h3>
      <p className="text-xs text-gray-500 mb-3">
        {allImages.length} imágenes · {comic.generated_pages?.length || 0} páginas + portada
      </p>

      <Button
        onClick={downloadZip}
        disabled={zipLoading || indivLoading}
        className="w-full h-11 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 rounded-xl gap-2 text-sm"
      >
        {zipLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : done === "zip" ? (
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {done === "zip" ? "¡Descargado!" : "Descargar ZIP completo"}
      </Button>

      <Button
        onClick={downloadIndividual}
        disabled={zipLoading || indivLoading}
        variant="outline"
        className="w-full h-11 border-white/10 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl gap-2 text-sm"
      >
        {indivLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : done === "indiv" ? (
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        ) : (
          <FileImage className="w-4 h-4" />
        )}
        {done === "indiv" ? "¡Descargadas!" : "Descargar páginas sueltas"}
      </Button>

      <div className="flex items-center gap-2 pt-1">
        <FolderOpen className="w-3.5 h-3.5 text-gray-600" />
        <p className="text-[11px] text-gray-600">
          ZIP incluye imágenes numeradas + guion en .txt
        </p>
      </div>
    </div>
  );
}