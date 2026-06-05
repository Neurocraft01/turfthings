import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, Camera, Globe, AtSign, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-black/8" style={{ background: "#0a1a0c" }}>
      {/* Map strip */}
      <div className="border-b border-white/5 py-4 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 bg-white/5">
        <span className="text-white/60 text-[13px] font-medium flex items-center gap-2">
          <MapPin size={14} className="text-brand" strokeWidth={2} />
          Find us at Karvenagar, Pune
        </span>
        <Link
          href="https://maps.app.goo.gl/NBPFY7NWae4ZCjjt7"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand text-[13px] font-medium tracking-[0.04em] flex items-center gap-2 hover:gap-3 transition-all duration-200 no-underline"
        >
          Open in Google Maps →
        </Link>
      </div>

      {/* Main footer */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 no-underline">
              <div className="relative w-[100px] h-[100px] rounded-3xl overflow-hidden flex-shrink-0">
                <Image
                  src="/logo.jpeg"
                  alt="Turf Things Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-[13px] text-white/60 leading-relaxed font-light max-w-[200px]">
              Book premium cricket &amp; football grounds across Pune. Fast, simple, reliable.
            </p>
            <div className="flex gap-2 mt-5">
              {[
                { Icon: Camera, label: "Instagram", href: "https://instagram.com/turf_things_" },
                { Icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/917030499191" },
                { Icon: Globe, label: "YouTube", href: "#" },
                { Icon: AtSign, label: "Twitter", href: "#" },
              ].map(({ Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-[34px] h-[34px] rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:border-brand hover:text-brand hover:bg-brand/5 transition-all duration-200 no-underline"
                >
                  <Icon size={15} strokeWidth={1.8} />
                </Link>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <div className="text-[10px] tracking-[0.12em] uppercase text-white mb-4 font-medium">
              Explore
            </div>
            <ul className="flex flex-col gap-3 list-none">
              {[
                { name: "About us", href: "/about" },
                { name: "Timings & rates", href: "/#timing" },
                { name: "Gallery", href: "/gallery" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-white/60 font-light hover:text-brand transition-colors duration-200 no-underline font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports — only Cricket & Football */}
          <div>
            <div className="text-[10px] tracking-[0.12em] uppercase text-white mb-4 font-medium">
              Sports
            </div>
            <ul className="flex flex-col gap-3 list-none">
              {["Football", "Cricket"].map((sport) => (
                <li key={sport}>
                  <Link
                    href="#"
                    className="text-[13px] text-white/60 font-light hover:text-brand transition-colors duration-200 no-underline font-medium"
                  >
                    {sport}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <div className="text-[10px] tracking-[0.12em] uppercase text-white mb-4 font-medium">
              Contact
            </div>
            <ul className="flex flex-col gap-4 list-none">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-brand flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-[13px] text-white/70 font-medium leading-relaxed">
                  Old Dudhane Lawns, 52, Sun Empire Rd,<br />Karvenagar, Pune, Maharashtra 411052
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-brand flex-shrink-0" strokeWidth={2} />
                <Link
                  href="tel:7030499191"
                  className="text-[13px] text-white/70 font-medium hover:text-brand transition-colors no-underline"
                >
                  +91 70304 99191
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-brand flex-shrink-0" strokeWidth={2} />
                <Link
                  href="mailto:turfthings999@gmail.com"
                  className="text-[13px] text-white/70 font-medium hover:text-brand transition-colors no-underline"
                >
                  turfthings999@gmail.com
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={16} className="text-brand flex-shrink-0" strokeWidth={2} />
                <span className="text-[13px] text-white/70 font-medium">
                  Daily 24/7
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal links */}
        <div className="border-t border-white/10 pt-8 mt-4">
          <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6">
            {[
              { name: "Cancellation policy", href: "/cancellation" },
              { name: "Privacy policy", href: "/privacy" },
              { name: "Terms of use", href: "/terms" },
              { name: "Refund policy", href: "#" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[12px] text-white/50 font-medium hover:text-brand transition-colors no-underline"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-[12px] text-white/50 font-medium">
              © {new Date().getFullYear()} Turf Things. All rights reserved.
            </span>
            <span className="text-[12px] text-white/50 font-medium">
              Made with <span className="text-brand">♥</span> in Pune
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
