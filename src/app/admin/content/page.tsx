"use client";

import { useState } from "react";
import { Image as ImageIcon, MessageSquareQuote, FileText, Plus, Trash2, Edit } from "lucide-react";

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<"gallery" | "reviews" | "pages">("gallery");

  const [images, setImages] = useState([
    { id: 1, src: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2070", title: "Main Pitch" },
    { id: 2, src: "https://images.unsplash.com/photo-1524015368236-bbf6f72545b6?q=80&w=2070", title: "Night Lighting" },
  ]);

  const [reviews, setReviews] = useState([
    { id: 1, name: "Alex Johnson", text: "The best turf in the city. The lighting is perfect." },
    { id: 2, name: "Sarah Williams", text: "Booking is seamless and the staff is incredibly helpful." }
  ]);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-foreground uppercase tracking-wider">Content Management</h1>
        <p className="text-gray-400 mt-1">Manage website images, reviews, and text</p>
      </div>

      <div className="flex border-b border-card-border mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab("gallery")}
          className={`flex items-center py-3 px-6 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "gallery" ? "border-brand text-brand" : "border-transparent text-gray-400 hover:text-foreground"
          }`}
        >
          <ImageIcon size={18} className="mr-2" /> Gallery
        </button>
        <button 
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center py-3 px-6 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "reviews" ? "border-brand text-brand" : "border-transparent text-gray-400 hover:text-foreground"
          }`}
        >
          <MessageSquareQuote size={18} className="mr-2" /> Reviews
        </button>
        <button 
          onClick={() => setActiveTab("pages")}
          className={`flex items-center py-3 px-6 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "pages" ? "border-brand text-brand" : "border-transparent text-gray-400 hover:text-foreground"
          }`}
        >
          <FileText size={18} className="mr-2" /> Page Content
        </button>
      </div>

      <div className="bg-card rounded-xl border border-card-border p-6">
        {activeTab === "gallery" && (
          <div className="animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl text-foreground uppercase">Gallery Images</h2>
              <button className="bg-brand hover:bg-brand-hover text-black font-bold py-2 px-4 rounded-sm flex items-center transition-colors">
                <Plus size={18} className="mr-2" /> Upload Image
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {images.map(img => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-card-border">
                  <img src={img.src} alt={img.title} className="w-full h-40 object-cover" />
                  <div className="p-3 bg-background">
                    <p className="text-foreground font-medium truncate">{img.title}</p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl text-foreground uppercase">Customer Reviews</h2>
              <button className="bg-brand hover:bg-brand-hover text-black font-bold py-2 px-4 rounded-sm flex items-center transition-colors">
                <Plus size={18} className="mr-2" /> Add Review
              </button>
            </div>

            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-background border border-card-border p-4 rounded-lg flex justify-between items-start">
                  <div>
                    <h3 className="text-foreground font-medium">{review.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">"{review.text}"</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-gray-400 hover:text-foreground transition-colors p-1"><Edit size={18} /></button>
                    <button className="text-gray-400 hover:text-red-500 transition-colors p-1"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "pages" && (
          <div className="animate-in fade-in">
            <h2 className="font-display text-2xl text-foreground uppercase mb-6">Edit About Page</h2>
            
            <div className="space-y-6 max-w-3xl">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mission Statement</label>
                <textarea 
                  rows={4}
                  className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors resize-none"
                  defaultValue="To elevate the local sports community by providing accessible, professional-grade facilities that inspire athletic excellence and foster team spirit."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Vision Statement</label>
                <textarea 
                  rows={4}
                  className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors resize-none"
                  defaultValue="To become the premier destination for sports enthusiasts across the region, recognized not just for our exceptional turf, but for the community we build."
                />
              </div>
              <button className="bg-brand hover:bg-brand-hover text-black font-bold py-2.5 px-6 rounded-sm uppercase tracking-wider transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
