import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Default pricing structure
const DEFAULT_PRICING = {
  weekday: [
    { period: "Morning",    time: "5:00 AM – 12:00 PM · 7 hours", price: "₹600",  pct: "60%"  },
    { period: "Afternoon",  time: "12:00 PM – 5:00 PM · 5 hours",  price: "₹400",  pct: "40%"  },
    { period: "Evening",    time: "5:00 PM – 12:00 AM · 7 hours",  price: "₹800",  pct: "80%"  },
    { period: "Late Night", time: "12:00 AM – 5:00 AM · 5 hours",  price: "₹1000", pct: "100%" },
  ],
  weekend: [
    { period: "Morning",    time: "5:00 AM – 12:00 PM · 7 hours", price: "₹600",  pct: "60%"  },
    { period: "Afternoon",  time: "12:00 PM – 5:00 PM · 5 hours",  price: "₹400",  pct: "40%"  },
    { period: "Evening",    time: "5:00 PM – 12:00 AM · 7 hours",  price: "₹800",  pct: "80%"  },
    { period: "Late Night", time: "12:00 AM – 5:00 AM · 5 hours",  price: "₹1000", pct: "100%" },
  ],
};

// GET /api/content — Retrieve gallery, reviews, site content, and pricing
export async function GET() {
  try {
    // 1. Fetch reviews — Seed if empty
    let reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' }
    });
    if (reviews.length === 0) {
      try {
        await prisma.review.createMany({
          data: [
            { name: "Rahul Sharma", role: "Box Cricket Captain", text: "Best turf in Pune! The pitch is always in perfect condition. We play every Sunday and the lights are so good even at midnight matches.", rating: 5, sport: "Cricket" },
            { name: "Sarah Williams", role: "Corporate Event Organiser", text: "Organised our company sports day here. The staff was super cooperative, ground was spotless and the booking process was instant. Highly recommend!", rating: 5, sport: "Football" },
            { name: "Amit Patel", role: "Weekend Warrior", text: "Excellent turf with top-class turf quality. The bounce is consistent, making it perfect for both football and cricket.", rating: 5, sport: "Football" }
          ]
        });
        reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
      } catch (seedErr) {
        console.error('Failed to seed reviews:', seedErr);
      }
    }

    // 2. Fetch gallery images — Seed if empty or has Unsplash URLs
    let gallery = await prisma.galleryImage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    const hasUnsplash = gallery.some(img => img.src.includes('unsplash.com'));
    
    if (gallery.length === 0 || hasUnsplash) {
      try {
        if (hasUnsplash) {
          await prisma.galleryImage.deleteMany({
            where: {
              src: {
                contains: 'unsplash.com'
              }
            }
          });
        }
        await prisma.galleryImage.createMany({
          data: [
            { src: "/turf1.jpeg", title: "Football Ground", category: "Grounds" },
            { src: "/turf2.jpg",  title: "Aerial View",     category: "Grounds" },
            { src: "/turf3.jpg",  title: "Turf Surface",    category: "Grounds" },
            { src: "/turf4.jpg",  title: "Cricket Pitch",   category: "Grounds" },
            { src: "/turf5.jpg",  title: "Night Lights",    category: "Grounds" },
            { src: "/turf6.jpg",  title: "5-a-Side Field",  category: "Grounds" },
            { src: "/turf7.jpg",  title: "Turf Overview",   category: "Grounds" },
          ]
        });
        gallery = await prisma.galleryImage.findMany({ orderBy: { createdAt: 'desc' } });
      } catch (seedErr) {
        console.error('Failed to seed gallery:', seedErr);
      }
    }

    // 3. Fetch Site Content (mission/vision/pricing) — Seed missing keys
    let contents = await prisma.siteContent.findMany();
    const existingKeys = contents.map(c => c.key);

    const toSeed: { key: string; value: string }[] = [];
    if (!existingKeys.includes('mission')) {
      toSeed.push({ key: 'mission', value: 'To elevate the local sports community by providing accessible, professional-grade facilities that inspire athletic excellence and foster team spirit.' });
    }
    if (!existingKeys.includes('vision')) {
      toSeed.push({ key: 'vision', value: 'To become the premier destination for sports enthusiasts across the region, recognized not just for our exceptional turf, but for the community we build.' });
    }
    if (!existingKeys.includes('pricing_weekday')) {
      toSeed.push({ key: 'pricing_weekday', value: JSON.stringify(DEFAULT_PRICING.weekday) });
    }
    if (!existingKeys.includes('pricing_weekend')) {
      toSeed.push({ key: 'pricing_weekend', value: JSON.stringify(DEFAULT_PRICING.weekend) });
    }

    if (toSeed.length > 0) {
      try {
        await prisma.siteContent.createMany({ data: toSeed });
        contents = await prisma.siteContent.findMany();
      } catch (seedErr) {
        console.error('Failed to seed site content:', seedErr);
      }
    }

    const pageContent = contents.reduce((acc: Record<string, string>, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    // Parse pricing JSON safely
    let pricing_weekday = DEFAULT_PRICING.weekday;
    let pricing_weekend = DEFAULT_PRICING.weekend;
    try {
      if (pageContent.pricing_weekday) pricing_weekday = JSON.parse(pageContent.pricing_weekday);
      if (pageContent.pricing_weekend) pricing_weekend = JSON.parse(pageContent.pricing_weekend);
    } catch { /* keep defaults */ }

    return NextResponse.json({
      reviews,
      gallery,
      pageContent,
      pricing: { weekday: pricing_weekday, weekend: pricing_weekend }
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

// POST /api/content — Add new review or gallery image
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'review') {
      const { name, role, text, rating, sport } = data;
      if (!name || !text) {
        return NextResponse.json({ error: 'Name and text are required' }, { status: 400 });
      }
      const review = await prisma.review.create({
        data: {
          name,
          role: role || 'Player',
          text,
          rating: Number(rating) || 5,
          sport: sport || 'Football'
        }
      });
      return NextResponse.json({ success: true, item: review }, { status: 201 });

    } else if (type === 'gallery') {
      const { src, title, category } = data;
      if (!src || !title) {
        return NextResponse.json({ error: 'Image source and title are required' }, { status: 400 });
      }
      const img = await prisma.galleryImage.create({
        data: { src, title, category: category || 'Grounds' }
      });
      return NextResponse.json({ success: true, item: img }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  } catch (error) {
    console.error('Failed to create content:', error);
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}

// PUT /api/content — Update mission / vision / pricing
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { mission, vision, pricing_weekday, pricing_weekend } = body;

    const updates: { key: string; value: string }[] = [];
    if (mission !== undefined) updates.push({ key: 'mission', value: mission });
    if (vision !== undefined) updates.push({ key: 'vision', value: vision });
    if (pricing_weekday !== undefined) updates.push({ key: 'pricing_weekday', value: JSON.stringify(pricing_weekday) });
    if (pricing_weekend !== undefined) updates.push({ key: 'pricing_weekend', value: JSON.stringify(pricing_weekend) });

    for (const { key, value } of updates) {
      await prisma.siteContent.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    return NextResponse.json({ success: true, message: 'Content updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to update content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}
