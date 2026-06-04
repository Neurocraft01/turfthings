import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/content — Retrieve gallery, reviews, and site content
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

    // 2. Fetch gallery images — Seed if empty
    let gallery = await prisma.galleryImage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    if (gallery.length === 0) {
      try {
        await prisma.galleryImage.createMany({
          data: [
            { src: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2070", title: "Main Pitch", category: "Grounds" },
            { src: "https://images.unsplash.com/photo-1524015368236-bbf6f72545b6?q=80&w=2070", title: "Night Lighting", category: "Grounds" },
            { src: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?q=80&w=2070", title: "Weekend Tournament", category: "Events" },
            { src: "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=2070", title: "Match Kickoff", category: "Matches" }
          ]
        });
        gallery = await prisma.galleryImage.findMany({ orderBy: { createdAt: 'desc' } });
      } catch (seedErr) {
        console.error('Failed to seed gallery:', seedErr);
      }
    }

    // 3. Fetch Site Content (mission/vision) — Seed if empty
    let contents = await prisma.siteContent.findMany();
    if (contents.length === 0) {
      try {
        await prisma.siteContent.createMany({
          data: [
            { key: "mission", value: "To elevate the local sports community by providing accessible, professional-grade facilities that inspire athletic excellence and foster team spirit." },
            { key: "vision", value: "To become the premier destination for sports enthusiasts across the region, recognized not just for our exceptional turf, but for the community we build." }
          ]
        });
        contents = await prisma.siteContent.findMany();
      } catch (seedErr) {
        console.error('Failed to seed site content:', seedErr);
      }
    }

    const pageContent = contents.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return NextResponse.json({ reviews, gallery, pageContent }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

// POST /api/content — Add new review or gallery image
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, ...data } = body; // type is 'review' or 'gallery'

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
        data: {
          src,
          title,
          category: category || 'Grounds'
        }
      });
      return NextResponse.json({ success: true, item: img }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  } catch (error) {
    console.error('Failed to create content:', error);
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}

// PUT /api/content — Update about page settings (mission/vision)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { mission, vision } = body;

    if (mission !== undefined) {
      await prisma.siteContent.upsert({
        where: { key: 'mission' },
        update: { value: mission },
        create: { key: 'mission', value: mission }
      });
    }

    if (vision !== undefined) {
      await prisma.siteContent.upsert({
        where: { key: 'vision' },
        update: { value: vision },
        create: { key: 'vision', value: vision }
      });
    }

    return NextResponse.json({ success: true, message: 'Content updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to update content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}
