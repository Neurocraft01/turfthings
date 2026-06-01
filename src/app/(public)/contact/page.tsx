import { MapPin, Phone, Mail, Send, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Turf Booking",
  description: "Get in touch with us for bookings, tournaments, or corporate events.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl md:text-7xl text-foreground uppercase tracking-wider mb-6">
            Get In <span className="text-brand">Touch</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Have questions about bookings, tournaments, or corporate events? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-card p-8 rounded-xl border border-card-border">
              <h2 className="font-display text-3xl text-foreground uppercase mb-6">Contact Info</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-brand/20 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <MapPin size={24} className="text-brand" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-foreground uppercase">Location</h3>
                    <p className="text-gray-400 mt-1">123 Sports Avenue, Green Park<br />City, ST 12345</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-brand/20 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <Phone size={24} className="text-brand" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-foreground uppercase">Phone</h3>
                    <p className="text-gray-400 mt-1">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-brand/20 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <Mail size={24} className="text-brand" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-foreground uppercase">Email</h3>
                    <p className="text-gray-400 mt-1">hello@turfbooking.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-card-border">
                <a 
                  href="https://wa.me/15551234567" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-[#25D366] hover:bg-[#128C7E] text-foreground font-bold py-4 rounded-sm transition-colors uppercase tracking-wider font-display text-xl"
                >
                  <MessageCircle size={24} className="mr-3" /> Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-card p-2 rounded-xl border border-card-border h-64 relative overflow-hidden">
              <div className="absolute inset-0 bg-background flex flex-col items-center justify-center text-gray-500">
                <MapPin size={48} className="mb-4 text-brand opacity-50" />
                <span className="font-display text-xl uppercase">Google Maps Embed</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card p-8 rounded-xl border border-card-border">
            <h2 className="font-display text-3xl text-foreground uppercase mb-6">Send a Message</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors"
                  placeholder="Your Name"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                <textarea 
                  rows={5}
                  className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full bg-brand hover:bg-brand-hover text-black font-bold py-4 rounded-sm uppercase tracking-wider text-xl font-display flex items-center justify-center transition-colors"
              >
                <Send size={20} className="mr-2" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
