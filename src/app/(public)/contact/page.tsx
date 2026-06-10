import { MapPin, Phone, Mail, Send, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Turf Things",
  description: "Get in touch with Turf Things for bookings, tournaments, or corporate events. Located at Karvenagar, Pune.",
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
            Have questions about bookings, tournaments, or corporate events? We&apos;re here to help.
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
                    <p className="text-gray-400 mt-1">Dudhane Lawns, 52, Sun Empire Rd,<br />Karvenagar, Pune, Maharashtra 411052</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-brand/20 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <Phone size={24} className="text-brand" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-foreground uppercase">Phone</h3>
                    <a href="tel:7030499191" className="text-gray-400 mt-1 hover:text-brand transition-colors block">+91 70304 99191</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-brand/20 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <Mail size={24} className="text-brand" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-foreground uppercase">Email</h3>
                    <a href="mailto:turfthings999@gmail.com" className="text-gray-400 mt-1 hover:text-brand transition-colors block">turfthings999@gmail.com</a>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-card-border">
                <a 
                  href="https://wa.me/917030499191?text=Hello%2C%20I%20would%20like%20to%20enquire%20about%20turf%20booking." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-sm transition-colors uppercase tracking-wider font-display text-xl"
                >
                  <MessageCircle size={24} className="mr-3" /> Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="bg-card rounded-xl border border-card-border overflow-hidden h-72">
              <iframe
                src="https://maps.google.com/maps?q=18.4817695,73.8154643&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Turf Things Location - Karvenagar Pune"
              />
            </div>
          </div>

          {/* Contact Form → WhatsApp redirect */}
          <div className="bg-card p-8 rounded-xl border border-card-border">
            <h2 className="font-display text-3xl text-foreground uppercase mb-2">Send a Message</h2>
            <p className="text-sm text-gray-400 mb-6">Fill in the form, then tap the button to send via WhatsApp.</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                <input 
                  id="contact-name"
                  type="text" 
                  className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors"
                  placeholder="Your Name"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                  <input 
                    id="contact-email"
                    type="email" 
                    className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                  <input 
                    id="contact-phone"
                    type="tel" 
                    className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors"
                    placeholder="+91 70304 99191"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                <textarea 
                  id="contact-message"
                  rows={5}
                  className="w-full bg-background border border-card-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-brand transition-colors resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <a 
                href="https://wa.me/917030499191?text=Hello%2C%20I%20have%20a%20query%20about%20turf%20booking."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-4 rounded-sm uppercase tracking-wider text-xl font-display flex items-center justify-center transition-colors"
              >
                <Send size={20} className="mr-2" /> Send via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
