"use client";

import { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  MessageSquareQuote,
  FileText,
  DollarSign,
  Plus,
  Trash2,
  Upload,
  X,
  Star,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

/* ─── Types ─── */
type TabType = "gallery" | "reviews" | "pricing" | "pages";

interface GalleryImage {
  id: string;
  src: string;
  title: string;
  category: string;
}

interface Review {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  sport: string;
}

interface PricingSlot {
  period: string;
  time: string;
  price: string;
  pct: string;
}

interface Toast {
  type: "success" | "error";
  message: string;
}

/* ─── Toast Component ─── */
function ToastNotif({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 ${
        toast.type === "success"
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
      ) : (
        <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
      )}
      {toast.message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

/* ─── Image Upload Component ─── */
function ImageUploader({
  onUploadComplete,
}: {
  onUploadComplete: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        onUploadComplete(data.url);
      } else {
        alert(data.error || "Upload failed. Check Cloudinary credentials in .env");
      }
    } catch {
      alert("Upload failed. Check if Cloudinary credentials are set in .env");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
        dragOver
          ? "border-brand bg-brand/5"
          : "border-card-border hover:border-brand/50"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <div
        className="flex flex-col items-center justify-center p-8 cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 size={28} className="text-white animate-spin" />
              </div>
            )}
            {!uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-400" />
              </div>
            )}
          </div>
        ) : (
          <>
            <Upload size={32} className="text-brand/50 mb-3" />
            <p className="text-sm font-medium text-foreground">
              Click or drag &amp; drop to upload
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Add Image Modal ─── */
function AddImageModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (img: { src: string; title: string; category: string }) => void;
}) {
  const [src, setSrc] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Grounds");
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!src || !title) return;
    setSaving(true);
    await onAdd({ src, title, category });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-card-border animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-card-border">
          <h2 className="font-display text-xl text-foreground uppercase tracking-wider">
            Add Gallery Image
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Upload / URL tabs */}
          <div className="flex rounded-lg border border-card-border overflow-hidden">
            {(["upload", "url"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  tab === t
                    ? "bg-brand text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t === "upload" ? "📁 Upload File" : "🔗 Image URL"}
              </button>
            ))}
          </div>

          {tab === "upload" ? (
            <ImageUploader onUploadComplete={setSrc} />
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Direct Image URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={src}
                onChange={(e) => setSrc(e.target.value)}
                className="w-full border border-card-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:border-brand"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Image Title *
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Night Tournament"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-card-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-card-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:border-brand"
            >
              <option value="Grounds">Grounds</option>
              <option value="Events">Events</option>
              <option value="Matches">Matches</option>
            </select>
          </div>

          {src && (
            <div className="rounded-lg overflow-hidden border border-card-border h-32">
              <img src={src} alt="preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-card-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!src || !title || saving}
              className="px-5 py-2 rounded-lg text-sm font-bold bg-brand text-white hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              Add to Gallery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Add Review Modal ─── */
function AddReviewModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (r: { name: string; role: string; text: string; rating: number; sport: string }) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Player");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [sport, setSport] = useState("Football");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onAdd({ name, role, text, rating, sport });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-card-border animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-card-border">
          <h2 className="font-display text-xl text-foreground uppercase tracking-wider">
            Add Review
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Customer Name *</label>
              <input
                required
                type="text"
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-card-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Role / Title</label>
              <input
                type="text"
                placeholder="Football Coach"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-card-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Review Text *</label>
            <textarea
              required
              rows={4}
              placeholder="What did they say about the turf?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-card-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:border-brand resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={22}
                      className={s <= rating ? "text-brand fill-brand" : "text-gray-200 fill-gray-200"}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sport</label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full border border-card-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:border-brand"
              >
                <option value="Football">Football</option>
                <option value="Cricket">Cricket</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-card-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || !text || saving}
              className="px-5 py-2 rounded-lg text-sm font-bold bg-brand text-white hover:bg-brand-hover disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              Add Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════ */
export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("gallery");

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [nightBookingEnabled, setNightBookingEnabled] = useState(true);
  const [weekdayRates, setWeekdayRates] = useState<PricingSlot[]>([]);
  const [weekendRates, setWeekendRates] = useState<PricingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPage, setSavingPage] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Modals
  const [showAddImage, setShowAddImage] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };

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
        setNightBookingEnabled(data.night_booking_enabled ?? true);
        setWeekdayRates(data.pricing?.weekday || []);
        setWeekendRates(data.pricing?.weekend || []);
      }
    } catch (e) {
      console.error("Failed to load content", e);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Gallery ─── */
  const handleAddImage = async (imgData: { src: string; title: string; category: string }) => {
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "gallery", ...imgData }),
      });
      if (res.ok) {
        showToast("success", "Gallery image added successfully!");
        fetchContent();
      } else {
        showToast("error", "Failed to add image.");
      }
    } catch {
      showToast("error", "Error adding image.");
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Delete this gallery image?")) return;
    try {
      const res = await fetch(`/api/content/${id}?type=gallery`, { method: "DELETE" });
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        showToast("success", "Image deleted.");
      }
    } catch {
      showToast("error", "Failed to delete image.");
    }
  };

  /* ─── Reviews ─── */
  const handleAddReview = async (reviewData: {
    name: string;
    role: string;
    text: string;
    rating: number;
    sport: string;
  }) => {
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "review", ...reviewData }),
      });
      if (res.ok) {
        showToast("success", "Review added successfully!");
        fetchContent();
      } else {
        showToast("error", "Failed to add review.");
      }
    } catch {
      showToast("error", "Error adding review.");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      const res = await fetch(`/api/content/${id}?type=review`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        showToast("success", "Review deleted.");
      }
    } catch {
      showToast("error", "Failed to delete review.");
    }
  };

  /* ─── Page Content ─── */
  const handleSavePageContent = async () => {
    setSavingPage(true);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mission, vision, night_booking_enabled: nightBookingEnabled }),
      });
      if (res.ok) {
        showToast("success", "Page content updated!");
      } else {
        showToast("error", "Failed to save.");
      }
    } catch {
      showToast("error", "Error saving.");
    } finally {
      setSavingPage(false);
    }
  };

  /* ─── Pricing ─── */
  const updateRate = (
    type: "weekday" | "weekend",
    index: number,
    field: keyof PricingSlot,
    value: string
  ) => {
    if (type === "weekday") {
      setWeekdayRates((prev) =>
        prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
      );
    } else {
      setWeekendRates((prev) =>
        prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
      );
    }
  };

  const handleSavePricing = async () => {
    setSavingPricing(true);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricing_weekday: weekdayRates,
          pricing_weekend: weekendRates,
        }),
      });
      if (res.ok) {
        showToast("success", "Pricing updated! Changes are live on the home page.");
      } else {
        showToast("error", "Failed to save pricing.");
      }
    } catch {
      showToast("error", "Error saving pricing.");
    } finally {
      setSavingPricing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "gallery",  label: "Gallery",       icon: <ImageIcon size={16} /> },
    { id: "reviews",  label: "Reviews",        icon: <MessageSquareQuote size={16} /> },
    { id: "pricing",  label: "Pricing",        icon: <DollarSign size={16} /> },
    { id: "pages",    label: "Page Content",   icon: <FileText size={16} /> },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {toast && <ToastNotif toast={toast} onClose={() => setToast(null)} />}
      {showAddImage && (
        <AddImageModal onClose={() => setShowAddImage(false)} onAdd={handleAddImage} />
      )}
      {showAddReview && (
        <AddReviewModal onClose={() => setShowAddReview(false)} onAdd={handleAddReview} />
      )}

      <div className="mb-8">
        <h1 className="font-display text-4xl text-foreground uppercase tracking-wider">
          Content Management
        </h1>
        <p className="text-gray-400 mt-1">
          Changes here reflect live on the public website instantly.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-card-border mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "border-brand text-brand"
                : "border-transparent text-gray-400 hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-card-border p-6">
        {/* ── GALLERY TAB ── */}
        {activeTab === "gallery" && (
          <div className="animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-display text-2xl text-foreground uppercase">Gallery Images</h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  {images.length} image{images.length !== 1 ? "s" : ""} — shown on the home page gallery
                </p>
              </div>
              <button
                onClick={() => setShowAddImage(true)}
                className="bg-brand hover:bg-brand-hover text-white font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={16} />
                Add Image
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.length === 0 ? (
                <div className="col-span-full text-center py-16 text-gray-400">
                  <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No gallery images yet. Add your first one!</p>
                </div>
              ) : (
                images.map((img) => (
                  <div
                    key={img.id}
                    className="relative group rounded-xl overflow-hidden border border-card-border bg-background hover:border-brand/30 transition-all duration-200 shadow-sm"
                  >
                    <div className="relative h-44">
                      <img
                        src={img.src}
                        alt={img.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                    <div className="p-3">
                      <p className="text-foreground font-semibold text-sm truncate">
                        {img.title}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                        {img.category}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── REVIEWS TAB ── */}
        {activeTab === "reviews" && (
          <div className="animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-display text-2xl text-foreground uppercase">Customer Reviews</h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""} — displayed on the home page carousel
                </p>
              </div>
              <button
                onClick={() => setShowAddReview(true)}
                className="bg-brand hover:bg-brand-hover text-white font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={16} />
                Add Review
              </button>
            </div>

            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <MessageSquareQuote size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No reviews yet. Add your first one!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-background border border-card-border rounded-xl p-5 flex justify-between items-start gap-4 hover:border-brand/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-foreground">{review.name}</span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            review.sport === "Cricket"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {review.sport}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mb-2">
                        {review.role} ·{" "}
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={11} className="inline text-brand fill-brand" />
                        ))}
                      </p>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        &ldquo;{review.text}&rdquo;
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── PRICING TAB ── */}
        {activeTab === "pricing" && (
          <div className="animate-in fade-in">
            <div className="mb-6">
              <h2 className="font-display text-2xl text-foreground uppercase">Pricing</h2>
              <p className="text-gray-400 text-sm mt-0.5">
                Edit rates below. Changes will reflect live on the home page Timings &amp; Rates section.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {(["weekday", "weekend"] as const).map((type) => {
                const rates = type === "weekday" ? weekdayRates : weekendRates;
                return (
                  <div key={type} className="border border-card-border rounded-xl overflow-hidden">
                    <div className="bg-gray-50/80 px-5 py-3.5 border-b border-card-border">
                      <h3 className="font-semibold text-foreground capitalize text-sm tracking-wide">
                        {type === "weekday" ? "🗓 Weekday" : "🎉 Weekend"} Rates
                      </h3>
                    </div>
                    <div className="p-4 space-y-4">
                      {rates.map((rate, i) => (
                        <div key={rate.period} className="bg-background rounded-lg p-4 border border-card-border">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-foreground">
                              {rate.period}
                            </span>
                            <span className="text-xs text-brand font-bold bg-brand/10 px-2 py-0.5 rounded">
                              {rate.price} / hr
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">
                                Price (e.g. ₹800)
                              </label>
                              <input
                                type="text"
                                value={rate.price}
                                onChange={(e) => updateRate(type, i, "price", e.target.value)}
                                className="w-full border border-card-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-brand"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">
                                Bar Width (e.g. 80%)
                              </label>
                              <input
                                type="text"
                                value={rate.pct}
                                onChange={(e) => updateRate(type, i, "pct", e.target.value)}
                                className="w-full border border-card-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-brand"
                              />
                            </div>
                          </div>
                          <div className="mt-2">
                            <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">
                              Time Description
                            </label>
                            <input
                              type="text"
                              value={rate.time}
                              onChange={(e) => updateRate(type, i, "time", e.target.value)}
                              className="w-full border border-card-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-brand"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between pt-6 border-t border-card-border">
              <p className="text-xs text-gray-400">
                💡 Pricing changes reflect immediately on the public home page.
              </p>
              <button
                onClick={handleSavePricing}
                disabled={savingPricing}
                className="bg-brand hover:bg-brand-hover text-white font-bold py-2.5 px-7 rounded-lg uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
              >
                {savingPricing ? <Loader2 size={14} className="animate-spin" /> : null}
                Save Pricing
              </button>
            </div>
          </div>
        )}

        {/* ── PAGE CONTENT TAB ── */}
        {activeTab === "pages" && (
          <div className="animate-in fade-in">
            <div className="mb-6">
              <h2 className="font-display text-2xl text-foreground uppercase">Global Settings &amp; About Page</h2>
              <p className="text-gray-400 text-sm mt-0.5">
                Edit global site settings and the mission &amp; vision statements.
              </p>
            </div>

            <div className="space-y-6 max-w-3xl">
              <div className="bg-background border border-card-border rounded-xl p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Night Booking</h3>
                  <p className="text-sm text-gray-500 mt-1">Enable or disable late-night booking slots (12 AM - 5 AM) on the landing page.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={nightBookingEnabled}
                    onChange={(e) => setNightBookingEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Mission Statement
                </label>
                <textarea
                  rows={4}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-brand transition-colors resize-none"
                  placeholder="Our mission is to..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Vision Statement
                </label>
                <textarea
                  rows={4}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-brand transition-colors resize-none"
                  placeholder="Our vision is to..."
                />
              </div>
              <button
                onClick={handleSavePageContent}
                disabled={savingPage}
                className="bg-brand hover:bg-brand-hover text-white font-bold py-2.5 px-7 rounded-lg uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
              >
                {savingPage ? <Loader2 size={14} className="animate-spin" /> : null}
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
