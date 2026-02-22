import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroCarousel() {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [images.length]);

  const loadImages = async () => {
    try {
      const data = await base44.entities.GalleryImage.list();
      if (data && data.length > 0) {
        setImages(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } else {
        // Generar imágenes iniciales si no hay
        generateInitialImages();
      }
    } catch (err) {
      console.error('Error loading images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInitialImages = async () => {
    const prompts = [
      { title: "One Piece Adventure", prompt: "Luffy in epic battle stance, anime style, One Piece manga art, dynamic action pose, vibrant colors, professional illustration" },
      { title: "Pokemon Battle", prompt: "Pikachu vs Charizard epic battle, Pokemon anime style, dynamic combat, bright colors, professional anime art" },
      { title: "Manga Warrior", prompt: "Anime samurai warrior with sword, manga style, traditional Japanese art, detailed shading, cool color palette" },
      { title: "Pokemon Evolution", prompt: "All starter Pokemon in row, anime style, cute design, colorful background, Pokemon official art style" },
      { title: "Anime Group", prompt: "Group of anime characters in cool setting, manga style, action pose, vibrant colors, professional illustration" }
    ];

    try {
      const images = await Promise.all(
        prompts.map(async ({ title, prompt }, idx) => {
          const result = await base44.integrations.Core.GenerateImage({
            prompt
          });
          return {
            title,
            image_url: result.url,
            category: ["one_piece", "pokemon", "manga", "pokemon", "anime"][idx],
            is_ai_generated: true,
            prompt,
            order: idx
          };
        })
      );

      await Promise.all(images.map(img => base44.entities.GalleryImage.create(img)));
      setImages(images);
    } catch (err) {
      console.error('Error generating images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const next = () => {
    setCurrent((current + 1) % images.length);
  };

  const prev = () => {
    setCurrent((current - 1 + images.length) % images.length);
  };

  if (isLoading || images.length === 0) {
    return null;
  }

  const image = images[current];

  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden -z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={image.image_url}
            alt={image.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
        </motion.div>
      </AnimatePresence>

      {/* Dots - Bottom center */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === current ? "bg-white w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}