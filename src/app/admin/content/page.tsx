"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, MessageSquareQuote, FileText, Plus, Trash2, Edit } from "lucide-react";

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<"gallery" | "reviews" | "pages">("gallery");

  const [images, setImages] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
        setImages(data.gallery || []);
        setReviews(data.reviews || []);
        setMission(data.pageContent?.mission || "");
        setVision(data.pageContent?.vision || "");
      }
    } catch (e) {
      console.error("Failed to load content details", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async () => {
    const name = prompt("Enter customer name:");
    if (!name) return;
    const role = prompt("Enter customer role (e.g. Football Coach, Box Cricket Captain):", "Player");
    const text = prompt("Enter review text:");
    if (!text) return;
    const ratingStr = prompt("Enter rating (1 to 5):", "5");
    const rating = Number(ratingStr) || 5;
    const sport = prompt("Enter sport (Football or Cricket):", "Football");

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "review", name, role, text, rating, sport }),
      });
      if (res.ok) {
        alert("Review added successfully!");
        fetchContent();
      }
    } catch (e) {
      console.error("Failed to add review", e);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/content/${id}?type=review`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete review", e);
    }
  };

  const handleAddImage = async () => {
    const src = prompt("Enter image Unsplash / direct URL:");
    if (!src) return;
    const title = prompt("Enter image title (e.g., Night Tournament):");
    if (!title) return;
    const category = prompt("Enter image category (Grounds, Events, or Matches):", "Grounds");

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "gallery", src, title, category }),
      });
      if (res.ok) {
        alert("Gallery image added successfully!");
        fetchContent();
      }
    } catch (e) {
      console.error("Failed to add gallery image", e);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery image?")) return;
    try {
      const res = await fetch(`/api/content/${id}?type=gallery`, {
        method: "DELETE",
      });
      if (res.ok) {
        setImages(prev => prev.filter(img => img.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete image", e);
    }
  };

  const handleSavePageContent = async () => {
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mission, vision }),
      });
      if (res.ok) {
        alert("Vision & mission statement updated successfully!");
        fetchContent();
      }
    } catch (e) {
      console.error("Failed to save statement updates", e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

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
              <button 
                onClick={handleAddImage}
                className="bg-brand hover:bg-brand-hover text-black font-bold py-2 px-4 rounded-sm flex items-center transition-colors"
              >
                <Plus size={18} className="mr-2" /> Upload Image
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {images.length === 0 ? (
                <p className="text-gray-500 col-span-full">No gallery images in database.</p>
              ) : images.map(img => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-card-border">
                  <img src={img.src} alt={img.title} className="w-full h-40 object-cover" />
                  <div className="p-3 bg-background">
                    <p className="text-foreground font-medium truncate">{img.title}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{img.category}</p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteImage(img.id)}
                      className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition-colors"
                    >
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
              <button 
                onClick={handleAddReview}
                className="bg-brand hover:bg-brand-hover text-black font-bold py-2 px-4 rounded-sm flex items-center transition-colors"
              >
                <Plus size={18} className="mr-2" /> Add Review
              </button>
            </div>

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-gray-500">No customer reviews in database.</p>
              ) : reviews.map(review => (
                <div key={review.id} className="bg-background border border-card-border p-4 rounded-lg flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-foreground font-medium">{review.name}</h3>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-brand px-2 py-0.5 rounded bg-brand/10 border border-brand/20">
                        {review.sport}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{review.role} · {review.rating} Stars</p>
                    <p className="text-gray-400 text-sm mt-2">"{review.text}"</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={18} />
                    </button>
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
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Vision Statement</label>
                <textarea 
                  rows={4}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors resize-none"
                />
              </div>
              <button 
                onClick={handleSavePageContent}
                className="bg-brand hover:bg-brand-hover text-black font-bold py-2.5 px-6 rounded-sm uppercase tracking-wider transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
