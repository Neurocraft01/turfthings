import { Target, Shield, Zap, Users, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card py-20 border-b border-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-5xl md:text-7xl text-foreground uppercase tracking-wider mb-6">
            About <span className="text-brand">Us</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We are dedicated to providing the best sports facility experience in the city. From our premium FIFA-approved turf to our top-notch amenities, everything is designed for the love of the game.
          </p>
        </div>
      </div>

      {/* Vision & Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-card p-10 rounded-xl border border-card-border hover:border-brand transition-colors">
              <div className="w-16 h-16 bg-brand/20 rounded-full flex items-center justify-center mb-6">
                <Target size={32} className="text-brand" />
              </div>
              <h2 className="font-display text-3xl text-foreground uppercase mb-4">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed">
                To elevate the local sports community by providing accessible, professional-grade facilities that inspire athletic excellence and foster team spirit. We believe everyone deserves to play on a pitch that brings out their best performance.
              </p>
            </div>
            <div className="bg-card p-10 rounded-xl border border-card-border hover:border-brand transition-colors">
              <div className="w-16 h-16 bg-brand/20 rounded-full flex items-center justify-center mb-6">
                <Shield size={32} className="text-brand" />
              </div>
              <h2 className="font-display text-3xl text-foreground uppercase mb-4">Our Vision</h2>
              <p className="text-gray-400 leading-relaxed">
                To become the premier destination for sports enthusiasts across the region, recognized not just for our exceptional turf, but for the community we build and the passion for sports we ignite in every player who steps onto our field.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Details */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-foreground uppercase tracking-wider mb-4">
              World-Class <span className="text-brand">Amenities</span>
            </h2>
            <div className="w-24 h-1 bg-brand mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "FIFA Approved Turf", desc: "Latest generation artificial grass mimicking natural feel", icon: Zap },
              { title: "Pro Lighting", desc: "400 lux LED floodlights for perfect night matches", icon: Target },
              { title: "Locker Rooms", desc: "Spacious, clean, and secure changing facilities", icon: Users },
              { title: "Prime Location", desc: "Easily accessible with ample parking space", icon: MapPin }
            ].map((amenity, idx) => (
              <div key={idx} className="text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-background border border-card-border flex items-center justify-center mb-6">
                  <amenity.icon size={36} className="text-brand" />
                </div>
                <h3 className="font-display text-2xl text-foreground uppercase mb-2">{amenity.title}</h3>
                <p className="text-gray-400 text-sm">{amenity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="font-display text-4xl text-foreground uppercase mb-8">Ready to experience the best?</h2>
        <Link 
          href="/#book" 
          className="inline-block bg-brand hover:bg-brand-hover text-black font-bold py-4 px-10 rounded-sm uppercase tracking-wider text-xl transition-transform transform hover:scale-105"
        >
          Book Your Slot Now
        </Link>
      </section>
    </div>
  );
}
