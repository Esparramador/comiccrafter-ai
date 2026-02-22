import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, UserCircle, Plus, Camera, Library, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export default function ShortsCharacterStep({ characters, setCharacters }) {
  const fileInputRefs = useRef({});
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);

  const { data: savedChars = [] } = useQuery({
    queryKey: ["characters"],
    queryFn: () => base44.entities.Character.list("-created_date", 100),
  });

  const addCharacter = () => setCharacters([...characters, { name: "", description: "", photo_url: "" }]);
  const removeCharacter = (i) => setCharacters(characters.filter((_, idx) => idx !== i));
  const updateCharacter = (i, field, value) => {
    const updated = [...characters];
    updated[i] = { ...updated[i], [field]: value };
    setCharacters(updated);
  };

  const handlePhotoUpload = async (index, files) => {
    setUploadingIndex(index);
    const results = await Promise.all(Array.from(files).map(f => base44.integrations.Core.UploadFile({ file: f })));
    const allPhotos = [...(characters[index].photo_urls || (characters[index].photo_url ? [characters[index].photo_url] : [])), ...results.map(r => r.file_url)];
    const updated = [...characters];
    updated[index] = { ...updated[index], photo_urls: allPhotos, photo_url: allPhotos[0] || "" };
    setCharacters(updated);
    setUploadingIndex(null);
  };

  const removePhoto = (ci, pi) => {
    const updated = [...characters];
    const photos = [...(updated[ci].photo_urls || [])];
    photos.splice(pi, 1);
    updated[ci] = { ...updated[ci], photo_urls: photos, photo_url: photos[0] || "" };
    setCharacters(updated);
  };

  const addFromLibrary = (saved) => {
    if (characters.some(c => c.name === saved.name)) return;
    const photos = saved.photo_urls || [];
    const withoutEmpty = characters.filter(c => c.name?.trim() !== "");
    setCharacters([...withoutEmpty, { name: saved.name, description: saved.description || "", photo_urls: photos, photo_url: photos[0] || "" }]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Personajes del Corto</h2>
        <p className="text-gray-400 text-sm">Define los protagonistas de tu historia animada. Puedes usar personajes ya creados.</p>
      </div>

      {savedChars.length > 0 && (
        <button
          onClick={() => setShowLibrary(!showLibrary)}
          className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
            showLibrary ? "border-pink-500/40 bg-pink-500/10 text-pink-300" : "border-white/5 bg-white/[0.02] text-gray-400 hover:text-pink-300 hover:border-pink-500/20"
          }`}
        >
          <Library className="w-4 h-4" />
          {showLibrary ? "Ocultar mis personajes" : `📚 Usar personajes guardados (${savedChars.length})`}
        </button>
      )}

      <AnimatePresence>
        {showLibrary && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {savedChars.map(sc => {
              const added = characters.some(c => c.name === sc.name);
              const photo = (sc.photo_urls || [])[0];
              return (
                <button key={sc.id} onClick={() => addFromLibrary(sc)} disabled={added}
                  className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${added ? "border-pink-500/40 bg-pink-500/10 opacity-60 cursor-default" : "border-white/5 bg-white/[0.02] hover:border-pink-500/30 hover:bg-pink-500/5"}`}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : <UserCircle className="w-6 h-6 text-gray-600 m-auto mt-1.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{sc.name}</p>
                    <p className="text-xs text-gray-500 truncate">{sc.description?.slice(0, 30) || "Sin descripción"}</p>
                  </div>
                  {added && <Check className="w-4 h-4 text-pink-400 absolute top-2 right-2" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {characters.map((char, index) => {
          const photos = char.photo_urls || (char.photo_url ? [char.photo_url] : []);
          return (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] group"
            >
              {characters.length > 1 && (
                <button onClick={() => removeCharacter(index)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-gray-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100">
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-2 mb-4">
                <UserCircle className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-medium text-pink-400 uppercase tracking-wider">Personaje {index + 1}</span>
              </div>
              <div className="space-y-3">
                <Input placeholder="Nombre del personaje" value={char.name} onChange={e => updateCharacter(index, "name", e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500/50" />
                <Textarea placeholder="Describe al personaje: personalidad, apariencia, poderes, rol en el corto..." value={char.description} onChange={e => updateCharacter(index, "description", e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500/50 h-20 resize-none" />
                <div>
                  <p className="text-xs text-gray-500 mb-2">Fotos de referencia</p>
                  <div className="flex flex-wrap gap-2">
                    {photos.map((url, pi) => (
                      <div key={pi} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 group/photo">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removePhoto(index, pi)} className="absolute inset-0 bg-black/50 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition-opacity">
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => fileInputRefs.current[index]?.click()} className="w-16 h-16 rounded-lg border-2 border-dashed border-white/10 hover:border-pink-500/40 flex flex-col items-center justify-center text-gray-500 hover:text-pink-400 transition-all">
                      {uploadingIndex === index ? <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" /> : <><Camera className="w-4 h-4 mb-0.5" /><span className="text-[9px]">Añadir</span></>}
                    </button>
                    <input ref={el => fileInputRefs.current[index] = el} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files?.length) handlePhotoUpload(index, e.target.files); e.target.value = ""; }} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <Button variant="outline" onClick={addCharacter} className="w-full h-12 border-dashed border-white/10 text-gray-400 hover:text-pink-300 hover:border-pink-500/30 hover:bg-pink-500/5 rounded-xl">
        <Plus className="w-4 h-4 mr-2" /> Añadir Personaje
      </Button>
    </div>
  );
}