"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Timing & Rates", href: "/#timing" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  /* Hero mode = home AND not yet scrolled */
  const heroMode = isHome && !scrolled;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500"
        style={{
          padding: heroMode ? "0 48px" : "0 48px",
          height: heroMode ? "80px" : "64px",
          background: heroMode
            ? "transparent"
            : "rgba(10, 26, 12, 0.55)",
          backdropFilter: heroMode ? "none" : "blur(18px) saturate(160%)",
          WebkitBackdropFilter: heroMode ? "none" : "blur(18px) saturate(160%)",
          borderBottom: heroMode
            ? "none"
            : "1px solid rgba(255,255,255,0.08)",
          boxShadow: heroMode ? "none" : "0 4px 24px rgba(0,0,0,0.18)",
        }}
      >
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 no-underline">
            <div
              className="relative overflow-hidden rounded-xl transition-all duration-500"
              style={{ width: heroMode ? "72px" : "56px", height: heroMode ? "72px" : "56px" }}
            >
              <Image
                src="/logo.jpeg"
                alt="Turf Things Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span
              className="hidden sm:block font-display tracking-widest uppercase transition-all duration-500"
              style={{
                fontSize: heroMode ? "15px" : "13px",
                color: "rgba(255,255,255,0.90)",
                letterSpacing: "0.14em",
              }}
            >
              Turf Things
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex gap-8 list-none">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="relative group no-underline"
                  style={{
                    fontSize: "13px",
                    fontWeight: 400,
                    letterSpacing: "0.05em",
                    color: "rgba(255,255,255,0.70)",
                    transition: "color 0.25s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,1)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.70)")
                  }
                >
                  {link.name}
                  {/* Animated underline */}
                  <span
                    className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 group-hover:w-full rounded-full bg-brand transition-all duration-300"
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Glassmorphism "Book Now" pill */}
            <Link
              href="/#book"
              className="hidden md:inline-flex items-center gap-2 no-underline transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                padding: "9px 22px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #27a84e 0%, #1d7a38 100%)",
                color: "#fff",
                boxShadow: "0 2px 16px rgba(39,168,78,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              Book Now
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white/80 hover:text-white transition-colors p-1"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[99] md:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="absolute top-0 left-0 right-0 pt-20 pb-8 px-6"
            style={{
              background: "rgba(10, 26, 12, 0.88)",
              backdropFilter: "blur(24px) saturate(160%)",
              WebkitBackdropFilter: "blur(24px) saturate(160%)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="flex flex-col gap-1 list-none mb-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-3.5 px-3 text-[15px] text-white/70 hover:text-white border-b border-white/8 transition-colors no-underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/#book"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center py-3.5 rounded-full text-white font-semibold text-[14px] tracking-[0.05em] no-underline transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #27a84e 0%, #1d7a38 100%)",
                boxShadow: "0 2px 16px rgba(39,168,78,0.35)",
              }}
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
