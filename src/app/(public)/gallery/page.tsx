"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";

type Category = "All" | "Facilities" | "Matches" | "Events";

const GALLERY_IMAGES = [
  { id: 1, src: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2070&auto=format&fit=crop", category: "Facilities", title: "Main Pitch" },
  { id: 2, src: "https://images.unsplash.com/photo-1524015368236-bbf6f72545b6?q=80&w=2070&auto=format&fit=crop", category: "Facilities", title: "Night Lighting" },
  { id: 3, src: "https://images.unsplash.com/photo-1518605368461-1ee135e69e0d?q=80&w=2070&auto=format&fit=crop", category: "Matches", title: "Weekend League" },
  { id: 4, src: "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=2074&auto=format&fit=crop", category: "Facilities", title: "Turf Surface" },
  { id: 5, src: "https://images.unsplash.com/photo-1431324155629-1a61046c8f43?q=80&w=2070&auto=format&fit=crop", category: "Events", title: "Corporate Tournament" },
  { id: 6, src: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=2069&auto=format&fit=crop", category: "Matches", title: "Youth Training" },
];

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<Category>("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredImages = activeTab === "All" 
    ? GALLERY_IMAGES 
    : GALLERY_IMAGES.filter(img => img.category === activeTab);

  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl md:text-7xl text-foreground uppercase tracking-wider mb-6">
            Our <span className="text-brand">Gallery</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Take a look at our state-of-the-art facilities and memorable moments on the pitch.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {["All", "Facilities", "Matches", "Events"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Category)}
              className={`px-6 py-2 rounded-full font-display uppercase tracking-wider transition-colors border ${
                activeTab === tab 
                  ? "bg-brand border-brand text-black" 
                  : "bg-transparent border-card-border text-gray-400 hover:border-brand hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <div 
              key={image.id} 
              className="group relative overflow-hidden rounded-xl aspect-video cursor-pointer"
              onClick={() => setSelectedImage(image.src)}
            >
              <img 
                src={image.src} 
                alt={image.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                <ZoomIn size={40} className="text-brand mb-3 transform scale-50 group-hover:scale-100 transition-transform duration-300" />
                <span className="font-display text-2xl text-foreground uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {image.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button 
            className="absolute top-6 right-6 text-foreground hover:text-brand transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={40} />
          </button>
          <img 
            src={selectedImage} 
            alt="Enlarged view" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg animate-in zoom-in-95 duration-300"
          />
        </div>
      )}
    </div>
  );
}
