import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Gallery | Turf Things Karvenagar Pune",
  description: "Browse images of Turf Things sports facility in Karvenagar, Pune. View our football turf, cricket pitches, pro floodlights, and premium amenities.",
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
