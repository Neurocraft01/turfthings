"use client";

import { useState, useEffect } from "react";
import { X, ZoomIn, Loader2 } from "lucide-react";
import Image from "next/image";

type Category = "All" | "Grounds" | "Events" | "Matches";

interface GalleryImage {
  id: string | number;
  src: string;
  title: string;
  category: string;
}

/* Default local turf images (same as home page galleryItems) */
const DEFAULT_IMAGES: GalleryImage[] = [
  { id: 1, src: "/turf1.jpeg", title: "Football Ground", category: "Grounds" },
  { id: 2, src: "/turf2.jpg",  title: "Aerial View",     category: "Grounds" },
  { id: 3, src: "/turf3.jpg",  title: "Turf Surface",    category: "Grounds" },
  { id: 4, src: "/turf4.jpg",  title: "Cricket Pitch",   category: "Grounds" },
  { id: 5, src: "/turf5.jpg",  title: "Night Lights",    category: "Grounds" },
  { id: 6, src: "/turf6.jpg",  title: "5-a-Side Field",  category: "Grounds" },
  { id: 7, src: "/turf7.jpg",  title: "Turf Overview",   category: "Grounds" },
];

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<Category>("All");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [images, setImages] = useState<GalleryImage[]>(DEFAULT_IMAGES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch("/api/content");
        if (res.ok) {
          const data = await res.json();
          if (data.gallery && data.gallery.length > 0) {
            setImages(data.gallery);
          }
        }
      } catch (err) {
        console.error("Failed to fetch gallery:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const categories = ["All", ...Array.from(new Set(images.map((img) => img.category)))];

  const filteredImages =
    activeTab === "All"
      ? images
      : images.filter((img) => img.category === activeTab);

  return (
    <div className="min-h-screen bg-[#0a1a0c] pt-20 pb-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="text-[10px] tracking-[0.18em] uppercase text-brand font-medium mb-4">
            Our Grounds
          </div>
          <h1
            className="font-display text-white leading-none mb-4"
            style={{ fontSize: "clamp(48px,8vw,96px)", letterSpacing: ".01em" }}
          >
            See the{" "}
            <em className="font-serif not-italic italic text-brand">grounds</em>
          </h1>
          <p className="text-[15px] text-white/50 font-light max-w-xl mx-auto leading-relaxed">
            Take a look at our state-of-the-art facilities and memorable moments on the pitch.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Category)}
              className={`px-6 py-2.5 rounded-full text-[12px] font-medium tracking-[.04em] transition-all duration-200 border ${
                activeTab === tab
                  ? "bg-brand border-brand text-white shadow-sm shadow-brand/30"
                  : "bg-white/5 border-white/10 text-white/60 hover:border-brand/40 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 size={36} className="animate-spin text-brand/40" />
          </div>
        )}

        {/* Image Grid */}
        {!loading && (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredImages.map((image, i) => (
              <div
                key={image.id}
                className="break-inside-avoid group relative overflow-hidden rounded-2xl cursor-pointer bg-white/5 border border-white/5 hover:border-brand/30 transition-all duration-300"
                onClick={() => setSelectedImage(image)}
                style={{
                  opacity: 0,
                  animation: `fadeUp 0.6s cubic-bezier(.16,1,.3,1) ${i * 60}ms forwards`,
                }}
              >
                <div className="relative w-full" style={{ paddingBottom: i % 3 === 0 ? "75%" : i % 3 === 1 ? "100%" : "60%" }}>
                  <img
                    src={image.src}
                    alt={image.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-50 group-hover:opacity-90 transition-opacity duration-300" />
                  {/* Overlay content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ZoomIn size={32} className="text-brand mb-3 transform scale-50 group-hover:scale-100 transition-transform duration-300" />
                    <span className="font-display text-lg text-white uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {image.title}
                    </span>
                  </div>
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-[.10em] px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/70 border border-white/10">
                    {image.category}
                  </span>
                  {/* Title bottom */}
                  <span className="absolute bottom-3 left-4 text-[11px] tracking-[.08em] uppercase text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {image.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredImages.length === 0 && (
          <div className="text-center py-20 text-white/30">
            <p className="text-lg font-display uppercase tracking-wider">No images in this category yet.</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-brand hover:text-white transition-all duration-200 border border-white/10"
            onClick={() => setSelectedImage(null)}
          >
            <X size={20} />
          </button>
          <div
            className="max-w-5xl w-full animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.src}
              alt={selectedImage.title}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl mx-auto shadow-2xl"
            />
            <div className="text-center mt-4">
              <p className="font-display text-white text-lg uppercase tracking-wider">{selectedImage.title}</p>
              <p className="text-[11px] text-white/40 uppercase tracking-[.12em] mt-1">{selectedImage.category}</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
