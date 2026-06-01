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
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: isHome ? "#about" : "/about" },
    { name: "Timing & Rates", href: isHome ? "#timing" : "/#timing" },
    { name: "Gallery", href: isHome ? "#gallery" : "/gallery" },
    { name: "Contact", href: isHome ? "#contact" : "/contact" },
  ];

  const isTransparent = isHome && !scrolled;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 py-3 flex justify-between items-center transition-all duration-400 ${
          isTransparent
            ? "bg-transparent"
            : "bg-white/92 dark:bg-[#0a1a0c]/95 backdrop-blur-md border-b border-black/8 dark:border-white/10 shadow-sm"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="relative w-[64px] h-[64px] rounded-2xl overflow-hidden">
            <Image
              src="/logo.jpeg"
              alt="Turf Things Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span
            className={`font-display text-[24px] tracking-[0.06em] transition-colors duration-400 hidden sm:block ${
              isTransparent ? "text-white" : "text-foreground dark:text-white"
            }`}
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
                className={`text-[13px] font-normal tracking-[0.04em] no-underline transition-colors duration-300 relative group ${
                  isTransparent
                    ? "text-white/70 hover:text-white"
                    : "text-muted dark:text-white/60 hover:text-foreground dark:hover:text-white"
                }`}
              >
                {link.name}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-300 bg-brand" />
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href={isHome ? "#contact" : "/contact"}
            className="hidden md:inline-flex text-[12px] font-medium px-5 py-2.5 rounded-full bg-brand text-white hover:bg-brand-hover transition-all duration-200 hover:scale-105 tracking-[0.04em]"
          >
            Book Now
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden transition-colors ${
              isTransparent ? "text-white" : "text-foreground dark:text-white"
            }`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[99] md:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="absolute top-0 left-0 right-0 bg-white/96 dark:bg-[#0a1a0c]/98 backdrop-blur-md border-b border-black/8 dark:border-white/10 pt-24 pb-6 px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="flex flex-col gap-1 list-none mb-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-3 px-2 text-[15px] text-foreground dark:text-white hover:text-brand border-b border-black/5 dark:border-white/5 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={isHome ? "#contact" : "/contact"}
              onClick={() => setIsOpen(false)}
              className="block w-full text-center py-3 rounded-full bg-brand text-white font-medium text-[13px] tracking-[0.04em] hover:bg-brand-hover transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
