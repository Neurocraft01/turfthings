"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  MapPin,
  ShieldCheck,
  Trophy,
  Sun,
  Cloud,
  Moon,
  Phone,
  Camera,
  Mail,
  Clock,
  ChevronRight,
  Circle,
  Star,
  Quote,
} from "lucide-react";

import BookingSection from "@/components/BookingSection";

/* ─── Scroll Reveal Hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Reveal Wrapper ─── */
function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  direction?: "up" | "left" | "right";
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal();
  const transforms: Record<string, string> = {
    up: "translateY(32px)",
    left: "translateX(-48px)",
    right: "translateX(48px)",
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[direction],
        transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.8s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Animated Bar ─── */
function AnimatedBar({ width }: { width: string }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className="h-[3px] rounded-full relative overflow-hidden bg-black/10 dark:bg-white/10 transition-colors duration-300"
    >
      <div
        className="absolute left-0 top-0 bottom-0 rounded-full bg-brand transition-all duration-[1000ms] ease-out"
        style={{ width: visible ? width : "0%" }}
      />
    </div>
  );
}

/* ─── Section Eyebrow ─── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] tracking-[0.16em] uppercase text-brand font-medium mb-5">
      {children}
    </div>
  );
}

/* ─── Rate period icon ─── */
function RateIcon({ period }: { period: string }) {
  const cls = "w-6 h-6";
  if (period === "Morning") return <Sun className={cls} strokeWidth={1.5} />;
  if (period === "Afternoon") return <Cloud className={cls} strokeWidth={1.5} />;
  if (period === "Evening") return <Moon className={cls} strokeWidth={1.5} />;
  if (period === "Late Night") return <Clock className={cls} strokeWidth={1.5} />;
  return <Moon className={cls} strokeWidth={1.5} />;
}

/* ─── Star rating ─── */
function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(count)].map((_, i) => (
        <Star key={i} size={14} className="text-brand fill-brand" />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function Home() {
  const [dayMode, setDayMode] = useState<"week" | "wend">("week");
  const [dynReviews, setDynReviews] = useState<any[]>([]);
  const [dynGallery, setDynGallery] = useState<any[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/api/content");
        if (res.ok) {
          const data = await res.json();
          if (data.reviews && data.reviews.length > 0) setDynReviews(data.reviews);
          if (data.gallery && data.gallery.length > 0) setDynGallery(data.gallery);
        }
      } catch (err) {
        console.error("Failed to fetch content:", err);
      }
    };
    fetchContent();
  }, []);

  /* Cursor dot */
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rx = 0, ry = 0, mx = 0, my = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.left = mx - 4 + "px";
        cursorRef.current.style.top = my - 4 + "px";
      }
    };
    document.addEventListener("mousemove", onMove);
    let raf: number;
    const animate = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = rx + "px";
        ringRef.current.style.top = ry + "px";
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const weekdayRates = [
    { period: "Morning",   time: "5:00 AM – 12:00 PM · 7 hours", price: "₹600", pct: "60%" },
    { period: "Afternoon", time: "12:00 PM – 5:00 PM · 5 hours",  price: "₹400", pct: "40%" },
    { period: "Evening",   time: "5:00 PM – 12:00 AM · 7 hours",  price: "₹800", pct: "80%" },
    { period: "Late Night", time: "12:00 AM – 5:00 AM · 5 hours",  price: "₹1000", pct: "100%" },
  ];

  const weekendRates = [
    { period: "Morning",   time: "5:00 AM – 12:00 PM · 7 hours", price: "₹600", pct: "60%" },
    { period: "Afternoon", time: "12:00 PM – 5:00 PM · 5 hours",  price: "₹400", pct: "40%" },
    { period: "Evening",   time: "5:00 PM – 12:00 AM · 7 hours",  price: "₹800", pct: "80%" },
    { period: "Late Night", time: "12:00 AM – 5:00 AM · 5 hours",  price: "₹1000", pct: "100%" },
  ];

  const rates = dayMode === "week" ? weekdayRates : weekendRates;

  const tickerItems = [
    "Football", "Cricket", "Football", "Cricket",
    "Football", "Cricket", "Football", "Cricket",
    "Football", "Cricket", "Football", "Cricket",
  ];

  return (
    <>
      {/* Custom cursor — desktop only */}
      <div
        ref={cursorRef}
        className="hidden lg:block w-2 h-2 rounded-full bg-brand fixed pointer-events-none z-[9999] mix-blend-multiply dark:mix-blend-screen"
        style={{ transition: "transform .15s, opacity .15s" }}
      />
      <div
        ref={ringRef}
        className="hidden lg:block w-8 h-8 rounded-full border border-brand fixed pointer-events-none z-[9998] opacity-40"
        style={{ transform: "translate(-50%,-50%)" }}
      />

      {/* ══ HERO (Video) ══════════════════════════════════════ */}
      <section
        id="hero"
        className="relative min-h-screen flex items-end overflow-hidden px-6 md:px-12 pb-16 md:pb-[72px]"
      >
        <div className="absolute inset-0 z-0 bg-[#0a1a0c]">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            style={{ opacity: 0.85 }}
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
        </div>
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to top, rgba(10,26,12,0.95) 0%, rgba(10,26,12,0.45) 55%, rgba(10,26,12,0.15) 100%)",
          }}
        />

        <div className="relative z-[2] max-w-3xl pb-4 w-full">
          <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase text-brand font-medium mb-5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-brand"
              style={{ animation: "pulse-dot 2s infinite" }}
            />
            Live slots available · Pune
          </div>
          <div
            className="font-display leading-none text-white overflow-hidden mb-4"
            style={{ fontSize: "clamp(52px,10vw,124px)", letterSpacing: ".01em" }}
          >
            <span
              className="block"
              style={{
                transform: "translateY(110%)",
                opacity: 0,
                animation: "lineUp 1s cubic-bezier(.16,1,.3,1) .1s forwards",
              }}
            >
              Book Your
            </span>
            <span
              className="block"
              style={{
                transform: "translateY(110%)",
                opacity: 0,
                animation: "lineUp 1s cubic-bezier(.16,1,.3,1) .22s forwards",
              }}
            >
              Perfect <span className="text-brand">Turf.</span>
            </span>
          </div>
          <p
            className="font-serif italic text-white/55 leading-relaxed max-w-sm"
            style={{
              fontSize: "18px",
              opacity: 0,
              animation: "fadeUp .9s cubic-bezier(.16,1,.3,1) .5s forwards",
            }}
          >
            Premium cricket &amp; football grounds, real-time availability, instant confirmation — all in one place.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3 sm:items-center mt-8 w-full sm:w-auto"
            style={{
              opacity: 0,
              animation: "fadeUp .9s cubic-bezier(.16,1,.3,1) .65s forwards",
            }}
          >
            <button
              onClick={() => document.getElementById("timing")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center gap-2 text-[13px] font-medium px-8 py-3.5 rounded-full bg-brand text-white border-none cursor-pointer tracking-[0.04em] hover:bg-brand-hover hover:scale-[1.04] transition-all duration-200 w-full sm:w-auto"
            >
              View Timings &amp; Rates
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              className="text-[13px] font-normal px-7 py-3.5 rounded-full text-white/80 border border-white/20 cursor-pointer tracking-[0.04em] hover:bg-white/18 hover:text-white transition-all duration-200 w-full sm:w-auto"
              style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)" }}
            >
              Learn More
            </button>
          </div>
        </div>

        <div
          className="absolute bottom-8 right-6 md:right-12 z-[2] flex flex-col items-center gap-2"
          style={{ opacity: 0, animation: "fadeUp .9s .9s forwards" }}
        >
          <span
            className="text-[9px] tracking-[0.15em] uppercase text-white/35 hidden md:block"
            style={{ writingMode: "vertical-rl" }}
          >
            Scroll
          </span>
          <div
            className="w-px h-8 md:h-12 relative overflow-hidden"
            style={{ background: "rgba(255,255,255,.3)" }}
          >
            <div
              className="absolute left-0 w-full bg-brand"
              style={{
                height: "100%",
                top: "-100%",
                animation: "scrollLine 1.8s ease-in-out infinite .9s",
              }}
            />
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 z-[2] overflow-hidden h-[38px] flex items-center"
          style={{
            borderTop: "1px solid rgba(255,255,255,.08)",
            background: "rgba(0,0,0,.35)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="flex whitespace-nowrap"
            style={{ animation: "ticker-move 20s linear infinite" }}
          >
            {tickerItems.map((item, i) => (
              <span
                key={i}
                className="text-[10px] tracking-[0.12em] uppercase text-white/40 px-7 flex items-center gap-2.5"
              >
                <Circle size={4} className="text-brand fill-brand" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABOUT (Olive Green) ═══════════════════════════════ */}
      <section id="about" className="py-24 md:py-32 px-6 md:px-12" style={{ background: "#0a1a0c" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center max-w-[1200px] mx-auto">
          {/* Left */}
          <Reveal direction="left">
            <Eyebrow>Why Turf Things</Eyebrow>
            <h2
              className="font-display leading-none mb-7 text-white"
              style={{ fontSize: "clamp(48px,6vw,84px)", letterSpacing: ".01em" }}
            >
              Where every
              <br />
              match <em className="font-serif not-italic italic text-brand">begins</em>
            </h2>
            <p className="text-[15px] text-white/60 leading-relaxed font-light max-w-[400px] mb-11">
              We connect players to premium turf facilities with zero friction. Our grounds meet
              professional standards — perfectly maintained, flood-lit, and ready for your next big game.
            </p>

            <div className="flex flex-col">
              {[
                { Icon: Zap,         title: "Instant confirmation", desc: "Book and confirm your slot in under 60 seconds" },
                { Icon: MapPin,      title: "Near you always",      desc: "Conveniently located across Pune" },
                { Icon: ShieldCheck, title: "Verified grounds",     desc: "Every turf inspected and rated by our team" },
                { Icon: Trophy,      title: "Cricket & Football",   desc: "Two premium sports, one perfect ground" },
              ].map(({ Icon, title, desc }, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 py-5 border-b border-white/10 first:border-t first:border-white/10"
                >
                  <div className="w-9 h-9 rounded-[10px] bg-white/5 flex items-center justify-center flex-shrink-0 text-brand">
                    <Icon size={17} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-white mb-0.5">{title}</div>
                    <div className="text-[13px] text-white/60 font-light leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Right — stats grid */}
          <Reveal direction="right">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-white/5 text-white rounded-[20px] p-6 md:p-7 relative overflow-hidden">
                <div className="font-display text-[48px] md:text-[54px] leading-none tracking-[.01em]">
                  120<span className="text-[24px] md:text-[28px] text-brand">+</span>
                </div>
                <div className="text-[12px] mt-2 font-light text-white/60 tracking-[.02em]">
                  Premium bookings this month
                </div>
              </div>

              <div className="bg-brand text-white rounded-[20px] p-6 md:p-7">
                <div className="font-display text-[48px] md:text-[54px] leading-none tracking-[.01em]">4.8</div>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 12 12" className="w-3 h-3 fill-white opacity-90">
                      <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" />
                    </svg>
                  ))}
                </div>
                <div className="text-[12px] mt-2 font-light opacity-80 tracking-[.02em]">
                  Average player rating
                </div>
              </div>

              <div className="col-span-2 rounded-[20px] overflow-hidden relative min-h-[160px] md:min-h-[200px]">
                <Image
                  src="https://images.unsplash.com/photo-1551958219-acbc595aeeff?q=80&w=900&auto=format&fit=crop"
                  alt="Aerial view of our football turf"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 text-[11px] tracking-[.08em] uppercase text-white/90 font-medium flex items-center gap-1.5">
                  <MapPin size={11} className="text-brand" />
                  Football ground · Pune
                </div>
              </div>

              <div className="rounded-[20px] p-6 md:p-7 bg-white/5">
                <div className="font-display text-[48px] md:text-[54px] leading-none text-brand tracking-[.01em]">
                  98<span className="font-display text-[22px] text-white/60">%</span>
                </div>
                <div className="text-[12px] mt-2 font-light text-white/60 tracking-[.02em]">
                  On-time confirmation rate
                </div>
              </div>
              <div className="rounded-[20px] p-6 md:p-7 bg-white/5">
                <div className="font-display text-[48px] md:text-[54px] leading-none text-white tracking-[.01em]">
                  24<span className="text-[24px] md:text-[28px] text-brand">/7</span>
                </div>
                <div className="text-[12px] mt-2 font-light text-white/60 tracking-[.02em]">
                  Support available
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ TIMING & RATES (White/Dark) ════════════════════════════ */}
      <section id="timing" className="bg-white dark:bg-[#0a1a0c] py-24 md:py-28 px-6 md:px-12 overflow-hidden border-t border-black/5 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-[1100px] mx-auto">
          <Reveal>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 lg:mb-16 gap-6">
              <div>
                <Eyebrow>Timings &amp; Rates</Eyebrow>
                <h2
                  className="font-display leading-none text-foreground dark:text-white transition-colors duration-300"
                  style={{ fontSize: "clamp(48px,5.5vw,78px)", letterSpacing: ".01em" }}
                >
                  Play any
                  <br />
                  time, any{" "}
                  <em className="font-serif not-italic italic text-brand">sport.</em>
                </h2>
              </div>
              <div className="text-left lg:text-right">
                <p className="text-[13px] text-muted dark:text-white/60 font-light leading-relaxed transition-colors duration-300">
                  <strong className="text-foreground dark:text-white font-medium">Football</strong> &amp;{" "}
                  <strong className="text-foreground dark:text-white font-medium">Cricket</strong>
                  <br />
                  Full-size turf · Flood-lit · Pune
                </p>
              </div>
            </div>
          </Reveal>

          {/* Day toggle */}
          <Reveal delay={100}>
            <div className="inline-flex rounded-full p-1 gap-0.5 mb-10 md:mb-14 bg-[#f7f7f5] dark:bg-white/5 transition-colors duration-300">
              {(["week", "wend"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDayMode(mode)}
                  className={`text-[12px] px-6 py-2.5 rounded-full border-none cursor-pointer font-sans tracking-[.04em] transition-all duration-250 ${
                    dayMode === mode ? "bg-white dark:bg-white/10 shadow-sm text-foreground dark:text-white" : "bg-transparent text-muted dark:text-white/60"
                  }`}
                >
                  {mode === "week" ? "Weekdays" : "Weekends"}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Timeline bar */}
          <Reveal delay={200}>
            <div className="mb-10 md:mb-14">
              <div className="text-[10px] tracking-[0.14em] uppercase text-muted dark:text-white/60 font-medium mb-4 transition-colors duration-300">
                Daily schedule — 24 hours
              </div>
              <div className="flex flex-col sm:flex-row rounded-2xl overflow-hidden border border-black/8 dark:border-white/10 transition-colors duration-300">
                {[
                  { flex: 7, bgClass: "bg-[#fffbf0] dark:bg-white/5", Icon: Sun,   price: rates[0].price, time: "5AM–12PM",  label: "Morning" },
                  { flex: 5, bgClass: "bg-[#f7f7f5] dark:bg-transparent", Icon: Cloud, price: rates[1].price, time: "12PM–5PM", label: "Afternoon" },
                  { flex: 7, bgClass: "bg-white dark:bg-white/5", Icon: Moon,  price: rates[2].price, time: "5PM–12AM", label: "Evening"  },
                  { flex: 5, bgClass: "bg-[#edf7f1] dark:bg-white/5", Icon: Clock, price: rates[3].price, time: "12AM–5AM", label: "Late Night" },
                ].map((seg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col justify-center items-center transition-all duration-500 gap-1 py-5 sm:py-0 sm:h-[72px] ${seg.bgClass}`}
                    style={{ flex: seg.flex }}
                  >
                    <div className="flex items-center gap-1.5 mb-1 sm:mb-0">
                      <seg.Icon size={14} strokeWidth={1.8} className="text-brand" />
                      <span className="text-[9px] tracking-[.08em] uppercase font-medium text-muted dark:text-white/60 transition-colors duration-300">
                        {seg.time}
                      </span>
                    </div>
                    <span key={seg.price + dayMode} className="font-display text-[26px] leading-none tracking-[.02em] text-foreground dark:text-white transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                      {seg.price}
                    </span>
                    <span className="text-[10px] hidden sm:block text-muted dark:text-white/60 transition-colors duration-300">
                      {seg.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Rate rows */}
          <div key={dayMode} className="border-t border-black/8 dark:border-white/10 transition-colors duration-300 animate-in fade-in duration-500">
            {rates.map((rate, i) => (
              <Reveal key={rate.period + dayMode} delay={150 + i * 100}>
                <div className="flex flex-col sm:flex-row sm:items-center py-6 sm:py-7 border-b border-black/8 dark:border-white/10 gap-4 sm:gap-0 relative overflow-hidden group transition-colors duration-300">
                  <div
                    className="hidden sm:block absolute left-0 top-0 bottom-0 w-0 group-hover:w-full transition-all duration-400 -z-0 rounded bg-[#edf7f1] dark:bg-white/5"
                    style={{ transitionTimingFunction: "cubic-bezier(.16,1,.3,1)" }}
                  />
                  <div className="relative z-[1] w-14 flex-shrink-0 text-brand hidden sm:block">
                    <RateIcon period={rate.period} />
                  </div>
                  <div className="relative z-[1] flex-1">
                    <div className="font-display leading-none text-foreground dark:text-white transition-colors duration-300" style={{ fontSize: "36px", letterSpacing: ".02em" }}>
                      {rate.period}
                    </div>
                    <div className="text-[12px] text-muted dark:text-white/60 font-light mt-1 tracking-[.02em] transition-colors duration-300">{rate.time}</div>
                  </div>
                  <div className="relative z-[1] flex-[2] sm:px-8 hidden sm:block">
                    <AnimatedBar width={rate.pct} />
                  </div>
                  <div className="relative z-[1] flex justify-between items-center sm:block">
                    <span className="block sm:hidden text-[12px] text-muted dark:text-white/60 font-light tracking-[.02em] transition-colors duration-300">Price per hour</span>
                    <div className="text-right">
                      <div className="font-display leading-none sm:min-w-[140px] text-foreground dark:text-white transition-colors duration-300 text-[44px] sm:text-[52px]" style={{ letterSpacing: ".01em" }}>
                        {rate.price}
                      </div>
                      <span className="hidden sm:block text-[12px] text-muted dark:text-white/60 font-light mt-1 tracking-[.02em] transition-colors duration-300">
                        per hour
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Late night band */}
          <Reveal delay={400}>
            <div className="mt-10 md:mt-12 bg-[#f7f7f5] dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[20px] px-6 md:px-10 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors duration-300">
              <div>
                <div className="text-[10px] tracking-[0.14em] uppercase text-brand font-medium mb-2">
                  Late night bookings
                </div>
                <div className="font-display text-foreground dark:text-white leading-none transition-colors duration-300" style={{ fontSize: "clamp(32px,4vw,36px)", letterSpacing: ".02em" }}>
                  Midnight &amp; Beyond
                </div>
                <div className="text-[13px] text-muted dark:text-white/60 font-light mt-2 transition-colors duration-300">
                  Available on call · custom rates · prior arrangement needed
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                <Link
                  href="tel:7030499191"
                  className="inline-flex items-center justify-center gap-2 text-[13px] font-medium px-7 py-3.5 rounded-full bg-brand text-white no-underline tracking-[.04em] hover:bg-brand-hover hover:scale-[1.02] transition-all duration-200 w-full md:w-auto"
                >
                  <Phone size={14} strokeWidth={2} />
                  Call 70304 99191
                </Link>
                <Link
                  href="https://instagram.com/turf_things_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-[12px] text-muted dark:text-white/60 font-medium tracking-[.04em] no-underline hover:text-brand dark:hover:text-brand transition-colors duration-300 w-full md:w-auto"
                >
                  <Camera size={13} strokeWidth={1.8} />
                  @turf_things_
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ LIVE BOOKING CALENDAR ═══════════════════════════ */}
      <BookingSection />

      {/* ══ INSTAGRAM CTA (Olive Green w/ Marquee) ════════════ */}
      <InstagramCTA />

      {/* ══ GALLERY (White/Dark) ══════════════════════════════ */}
      <section id="gallery" className="bg-white dark:bg-[#0a1a0c] py-24 md:py-28 px-6 md:px-12 transition-colors duration-300 border-t border-black/5 dark:border-white/10">
        <Reveal>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end max-w-[1200px] mx-auto mb-10 md:mb-12 gap-6">
            <div>
              <Eyebrow>Our Grounds</Eyebrow>
              <h2
                className="font-display leading-none text-foreground dark:text-white transition-colors duration-300"
                style={{ fontSize: "clamp(44px,5vw,68px)", letterSpacing: ".01em" }}
              >
                See the{" "}
                <em className="font-serif not-italic italic text-brand">grounds</em>
              </h2>
            </div>
            <GalleryFilter />
          </div>
        </Reveal>

        <div
          className="grid gap-3 md:gap-4 max-w-[1200px] mx-auto grid-cols-1 md:grid-cols-12"
          style={{ gridAutoRows: "80px" }}
        >
          {(dynGallery.length > 0 ? dynGallery.map((img, i) => ({
            colSpan: i % 3 === 0 ? 5 : i % 3 === 1 ? 4 : 3,
            rowSpan: 2,
            img: img.src,
            label: img.title,
            overlay: false
          })) : galleryItems).map((item, i) => (
            <GalleryCard key={i} {...item} />
          ))}
        </div>
      </section>

      {/* ══ REVIEWS (Olive Green) ═════════════════════════════ */}
      <ReviewsSection reviews={dynReviews} />

      {/* ══ CONTACT (White/Dark) ══════════════════════════════ */}
      <section
        id="contact"
        className="py-24 md:py-28 px-6 md:px-12 bg-white dark:bg-[#0a1a0c] border-t border-black/5 dark:border-white/10 transition-colors duration-300"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-[1100px] mx-auto">
          <Reveal direction="left">
            <Eyebrow>Get In Touch</Eyebrow>
            <h2
              className="font-display leading-none mb-5 text-foreground dark:text-white transition-colors duration-300"
              style={{ fontSize: "clamp(44px,5vw,68px)", letterSpacing: ".01em" }}
            >
              Let&apos;s talk
              <br />
              <em className="font-serif not-italic italic text-brand">sports.</em>
            </h2>
            <p className="text-[14px] text-muted dark:text-white/60 leading-relaxed font-light mb-10 max-w-sm transition-colors duration-300">
              Have a question, want to host an event, or need a custom booking? We&apos;re always on the field.
            </p>

            <div className="flex flex-col gap-5">
              {[
                { Icon: MapPin, label: "Location", val: "Dudhane Lawns, 52, Sun Empire Rd, Karvenagar, Pune, Maharashtra 411052", href: "https://maps.app.goo.gl/NBPFY7NWae4ZCjjt7" },
                { Icon: Phone,  label: "Phone",    val: "+91 70304 99191",  href: "tel:7030499191" },
                { Icon: Mail,   label: "Email",    val: "hello@turfthings.in", href: "mailto:hello@turfthings.in" },
                { Icon: Clock,  label: "Open Hours", val: "Daily 5:00 AM – 12:00 midnight" },
              ].map(({ Icon, label, val, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-[42px] h-[42px] rounded-xl bg-[#f7f7f5] dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/10 flex items-center justify-center flex-shrink-0 text-brand transition-colors duration-300">
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <div className="pt-0.5">
                    <div className="text-[10px] tracking-[.1em] uppercase text-muted dark:text-white/50 mb-1 font-medium transition-colors duration-300">{label}</div>
                    {href ? (
                      <Link href={href} className="text-[14px] no-underline text-foreground dark:text-white hover:text-brand dark:hover:text-brand transition-colors font-medium">
                        {val}
                      </Link>
                    ) : (
                      <div className="text-[14px] text-foreground dark:text-white font-medium transition-colors duration-300">{val}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal direction="right">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ══ INSTAGRAM CTA SECTION ═══════════════════════════════ */
function InstagramCTA() {
  const { ref, visible } = useReveal();

  const instaImages = [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551958219-acbc595aeeff?q=80&w=400&auto=format&fit=crop",
  ];

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-24 md:py-32"
      style={{ background: "#0a1a0c" }}
    >
      {/* Background Marquee */}
      <div className="absolute inset-0 flex flex-col justify-center gap-4 opacity-30">
        <div className="flex whitespace-nowrap" style={{ animation: "ticker-move 40s linear infinite" }}>
          {[...instaImages, ...instaImages, ...instaImages].map((img, i) => (
            <div key={i} className="relative w-[180px] h-[180px] md:w-[240px] md:h-[240px] mx-2 rounded-2xl overflow-hidden flex-shrink-0">
              <Image src={img} alt="Sports turf" fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a0c] via-[#0a1a0c]/80 to-[#0a1a0c]" />

      <div className="relative z-10 max-w-[800px] mx-auto px-6 md:px-12 flex flex-col items-center justify-center text-center">
        <div
          className="flex items-center gap-4 mb-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(20px)",
            transition: "opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1)",
          }}
        >
          <div className="w-[52px] h-[52px] rounded-2xl bg-white/10 flex items-center justify-center text-white">
            <Camera size={26} strokeWidth={1.5} />
          </div>
          <div className="w-[52px] h-[52px] rounded-2xl overflow-hidden relative border border-white/10 bg-white/5">
            <Image src="/logo.jpeg" alt="Turf Things" fill className="object-cover" />
          </div>
        </div>

        <h2
          className="font-display text-white leading-none mb-4"
          style={{
            fontSize: "clamp(32px,5vw,56px)",
            letterSpacing: ".01em",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(20px)",
            transition: "opacity 0.8s cubic-bezier(.16,1,.3,1) .1s, transform 0.8s cubic-bezier(.16,1,.3,1) .1s",
          }}
        >
          Join our <em className="font-serif not-italic italic text-brand">community</em>
        </h2>
        
        <p
          className="text-[15px] text-white/60 font-light max-w-md mx-auto leading-relaxed mb-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(20px)",
            transition: "opacity 0.8s cubic-bezier(.16,1,.3,1) .2s, transform 0.8s cubic-bezier(.16,1,.3,1) .2s",
          }}
        >
          Follow <strong className="font-medium text-white">@turf_things_</strong> on Instagram for match highlights, slot drops, and exclusive offers.
        </p>

        <Link
          href="https://instagram.com/turf_things_"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-brand text-white text-[13px] font-medium tracking-[.04em] no-underline hover:bg-brand-hover hover:scale-[1.04] transition-all duration-300 w-full sm:w-auto shadow-sm shadow-brand/20"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(20px)",
            transition: "opacity 0.8s cubic-bezier(.16,1,.3,1) .3s, transform 0.8s cubic-bezier(.16,1,.3,1) .3s",
          }}
        >
          <Camera size={16} strokeWidth={2} />
          Follow on Instagram
        </Link>
      </div>
    </section>
  );
}

/* ══ REVIEWS SECTION ══════════════════════════════════════ */
const reviews = [
  {
    name: "Rahul Sharma",
    role: "Box Cricket Captain",
    avatar: "R",
    rating: 5,
    text: "Best turf in Pune! The pitch is always in perfect condition. We play every Sunday and the lights are so good even at midnight matches.",
    sport: "Cricket",
    color: "#27a84e",
  },
  {
    name: "Priya Desai",
    role: "Corporate Event Organiser",
    avatar: "P",
    rating: 5,
    text: "Organised our company sports day here. The staff was super cooperative, ground was spotless and the booking process was instant. Highly recommend!",
    sport: "Football",
    color: "#1a6fc4",
  },
  {
    name: "Amit Patel",
    role: "Weekend Football League",
    avatar: "A",
    rating: 5,
    text: "The artificial grass quality is phenomenal — really easy on the knees. We've tried every turf in the city and this is simply the best.",
    sport: "Football",
    color: "#27a84e",
  },
  {
    name: "Sneha Joshi",
    role: "Cricket Enthusiast",
    avatar: "S",
    rating: 5,
    text: "Came for a birthday match — what a vibe! Flood lights, clean facilities, and the pitch was world-class. Will definitely be back next weekend.",
    sport: "Cricket",
    color: "#c47a1a",
  },
  {
    name: "Vikram Nair",
    role: "Football Coach",
    avatar: "V",
    rating: 5,
    text: "I bring my academy here every week. The turf surface is consistent, booking is reliable, and the management team is always helpful. 10/10.",
    sport: "Football",
    color: "#27a84e",
  },
];

interface DynReview {
  name: string;
  role: string;
  avatar?: string;
  rating: number;
  text: string;
  sport: string;
  color?: string;
}

function ReviewsSection({ reviews: customReviews }: { reviews?: DynReview[] }) {
  const { ref, visible } = useReveal();
  const [active, setActive] = useState(0);

  const displayReviews = customReviews && customReviews.length > 0 ? customReviews.map((r, i) => ({
    name: r.name,
    role: r.role,
    avatar: r.avatar || r.name.charAt(0).toUpperCase(),
    rating: r.rating,
    text: r.text,
    sport: r.sport,
    color: r.color || (i % 2 === 0 ? "#27a84e" : "#3b82f6")
  })) : reviews;

  /* Auto-advance */
  useEffect(() => {
    if (!visible || displayReviews.length === 0) return;
    const timer = setInterval(() => setActive((a) => (a + 1) % displayReviews.length), 4000);
    return () => clearInterval(timer);
  }, [visible, displayReviews.length]);

  return (
    <section className="py-24 md:py-28 px-6 md:px-12 overflow-hidden" style={{ background: "#0a1a0c" }}>
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <Reveal>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-8">
            <div>
              <Eyebrow>Player Reviews</Eyebrow>
              <h2
                className="font-display leading-none text-white"
                style={{ fontSize: "clamp(44px,5vw,68px)", letterSpacing: ".01em" }}
              >
                What our{" "}
                <em className="font-serif not-italic italic text-brand">players</em>
                <br />
                are saying
              </h2>
            </div>
            {/* Overall rating badge */}
            <div className="flex items-center gap-5 bg-white/5 rounded-2xl px-6 py-5 border border-white/10 w-full md:w-auto justify-center md:justify-start">
              <div>
                <div className="font-display text-[48px] leading-none text-white tracking-tight">4.9</div>
                <div className="mt-1"><Stars /></div>
                <div className="text-[11px] text-white/60 font-light mt-1.5 tracking-[.04em]">120+ reviews</div>
              </div>
              <div className="w-px h-14 bg-white/10" />
              <div className="flex flex-col gap-2">
                {[5, 4, 3].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-[11px] text-white/60 w-2">{star}</span>
                    <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full"
                        style={{ width: star === 5 ? "85%" : star === 4 ? "12%" : "3%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Cards grid */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {displayReviews.map((review, i) => (
            <div
              key={i}
              onClick={() => setActive(i)}
              className={`cursor-pointer ${i >= 3 && "hidden lg:block"} ${i === 2 && "hidden sm:block lg:block"} ${i === 1 && "hidden sm:block"} block`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(40px)",
                transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${i * 100}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${i * 100}ms`,
              }}
            >
              <div
                className={`bg-white/5 rounded-2xl p-6 md:p-7 h-full flex flex-col transition-all duration-300 border ${
                  active === i
                    ? "border-brand bg-white/10"
                    : "border-white/10 hover:border-brand/50"
                }`}
              >
                {/* Quote icon */}
                <Quote
                  size={26}
                  className="text-brand/50 mb-4 flex-shrink-0"
                  strokeWidth={1.5}
                />

                {/* Review text */}
                <p className="text-[14px] text-white leading-relaxed font-light flex-1 mb-6">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Rating */}
                <div className="mb-4">
                  <Stars count={review.rating} />
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-display text-[18px] flex-shrink-0"
                    style={{ background: review.color }}
                  >
                    {review.avatar}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-white">{review.name}</div>
                    <div className="text-[12px] text-white/60 font-light">{review.role}</div>
                  </div>
                  <div className="ml-auto">
                    <span
                      className="text-[10px] tracking-[.08em] uppercase font-medium px-2.5 py-1 rounded-full text-white/90"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                      }}
                    >
                      {review.sport}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 border-none cursor-pointer ${
                active === i ? "w-6 h-2 bg-brand" : "w-2 h-2 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Gallery Filter ── */
function GalleryFilter() {
  const [active, setActive] = useState("All");
  const filters = ["All", "Football", "Cricket"];
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => setActive(f)}
          className={`text-[12px] px-5 py-2.5 rounded-full border cursor-pointer transition-all duration-200 font-sans tracking-[.04em] ${
            active === f
              ? "bg-brand text-white border-brand shadow-sm"
              : "bg-white dark:bg-white/5 text-muted dark:text-white/60 border-black/10 dark:border-white/10 hover:bg-brand-light dark:hover:bg-white/10 hover:text-brand dark:hover:text-white hover:border-brand/30 dark:hover:border-white/20"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

/* ── Gallery items ── */
const galleryItems = [
  { colSpan: 5, rowSpan: 4, img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop", label: "Main Football Ground", overlay: false },
  { colSpan: 4, rowSpan: 2, img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=700&auto=format&fit=crop", label: "Cricket Pitch", overlay: false },
  { colSpan: 3, rowSpan: 2, img: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?q=80&w=600&auto=format&fit=crop", label: "Flood-lit Arena", overlay: false },
  { colSpan: 4, rowSpan: 2, img: "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=700&auto=format&fit=crop", label: "Box Cricket Net", overlay: false },
  { colSpan: 4, rowSpan: 2, img: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=700&auto=format&fit=crop", label: "5-a-Side Football", overlay: false },
  { colSpan: 4, rowSpan: 2, img: "https://images.unsplash.com/photo-1551958219-acbc595aeeff?q=80&w=700&auto=format&fit=crop", label: "Premium Turf Surface", overlay: false },
];

function GalleryCard({ colSpan, rowSpan, img, label, overlay }: (typeof galleryItems)[0]) {
  return (
    <div
      className="rounded-2xl overflow-hidden relative cursor-pointer group bg-black/5 dark:bg-white/5 h-[220px] md:h-auto md:[grid-column:var(--c)] md:[grid-row:var(--r)] transition-colors duration-300"
      style={{ "--c": `span ${colSpan}`, "--r": `span ${rowSpan}` } as React.CSSProperties}
    >
      <Image
        src={img}
        alt={label}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
      <span className="absolute bottom-4 left-5 text-[11px] tracking-[.08em] uppercase text-white font-medium opacity-100 md:opacity-0 md:translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 shadow-sm">
        <ChevronRight size={12} className="text-brand" />
        {label}
      </span>
      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <span className="text-white text-[15px] font-medium tracking-[.04em] font-sans">View all photos</span>
        </div>
      )}
    </div>
  );
}

/* ── Contact Form ── */
function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sport, setSport] = useState("Football");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: `${name.replace(/\s+/g, "").toLowerCase() || "user"}@example.com`,
          phone,
          sport,
          message,
        }),
      });
      if (res.ok) {
        setStatus("done");
        setName("");
        setPhone("");
        setSport("Football");
        setMessage("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("idle");
        alert("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("idle");
      alert("Error sending message.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-white/5 rounded-3xl p-7 md:p-9 border border-black/8 dark:border-white/10 shadow-sm transition-colors duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] tracking-[.1em] uppercase text-muted dark:text-white/60 font-medium transition-colors duration-300">Your name</label>
          <input
            type="text"
            placeholder="Rahul Sharma"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-[14px] px-4 py-3.5 border border-black/8 dark:border-white/10 rounded-[12px] bg-[#f7f7f5] dark:bg-white/5 text-foreground dark:text-white outline-none focus:border-brand dark:focus:border-brand focus:bg-white dark:focus:bg-white/10 transition-all duration-200 font-sans w-full"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] tracking-[.1em] uppercase text-muted dark:text-white/60 font-medium transition-colors duration-300">Phone number</label>
          <input
            type="text"
            placeholder="+91 98765 00000"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="text-[14px] px-4 py-3.5 border border-black/8 dark:border-white/10 rounded-[12px] bg-[#f7f7f5] dark:bg-white/5 text-foreground dark:text-white outline-none focus:border-brand dark:focus:border-brand focus:bg-white dark:focus:bg-white/10 transition-all duration-200 font-sans w-full"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mb-4">
        <label className="text-[10px] tracking-[.1em] uppercase text-muted dark:text-white/60 font-medium transition-colors duration-300">Sport interest</label>
        <select 
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="text-[14px] px-4 py-3.5 border border-black/8 dark:border-white/10 rounded-[12px] bg-[#f7f7f5] dark:bg-white/5 text-foreground dark:text-white outline-none focus:border-brand dark:focus:border-brand focus:bg-white dark:focus:bg-white/10 transition-all duration-200 font-sans appearance-none cursor-pointer w-full"
        >
          {["Football", "Cricket", "Both"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5 mb-6">
        <label className="text-[10px] tracking-[.1em] uppercase text-muted dark:text-white/60 font-medium transition-colors duration-300">Message</label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you're planning — team size, preferred timing, any special requirements..."
          className="text-[14px] px-4 py-3.5 border border-black/8 dark:border-white/10 rounded-[12px] bg-[#f7f7f5] dark:bg-white/5 text-foreground dark:text-white outline-none focus:border-brand dark:focus:border-brand focus:bg-white dark:focus:bg-white/10 transition-all duration-200 font-sans resize-none w-full"
        />
      </div>

      <button
        type="submit"
        disabled={status !== "idle"}
        className="w-full py-4 rounded-full bg-brand text-white text-[14px] font-medium tracking-[.06em] cursor-pointer hover:bg-brand-hover hover:scale-[1.01] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-sans flex items-center justify-center gap-2 shadow-sm"
      >
        {status === "idle"    && (<>Send Message <ChevronRight size={16} /></>)}
        {status === "sending" && "Sending..."}
        {status === "done"    && "✓ Message sent!"}
      </button>
    </form>
  );
}
