import React, { useState } from "react";
import { Globe, ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang, LANGUAGES } from "@/lib/i18n";

export default function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const filtered = LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-gray-300 hover:text-white transition-all"
      >
        <Globe className="w-3.5 h-3.5 text-violet-400" />
        <span>{selected.flag}</span>
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearch(""); }} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-[#111118] shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-2 border-b border-white/5">
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5">
                  <Search className="w-3 h-3 text-gray-500 shrink-0" />
                  <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="bg-transparent text-xs text-white placeholder:text-gray-600 outline-none w-full"
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-64">
                {filtered.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setOpen(false); setSearch(""); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-white/5 transition-colors ${
                      lang === l.code ? "bg-violet-500/10 text-violet-300" : "text-gray-300"
                    }`}
                  >
                    <span className="text-base">{l.flag}</span>
                    <span className="font-medium">{l.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}