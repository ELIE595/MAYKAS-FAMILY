import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/photos — toutes les photos de la famille
export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      include: {
        membre: { select: { prenom: true, nom: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: photos });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Erreur lors de la récupération des photos." }, { status: 500 });
  }
}

// POST /api/photos — ajouter une photo
export async function POST(request: NextRequest) {
  try {
    const { url, legende, album, membreId } = await request.json();

    if (!url || !membreId) {
      return NextResponse.json({ success: false, error: "URL et membre requis." }, { status: 400 });
    }

    const photo = await prisma.photo.create({
      data: { url, legende, album, membreId },
    });

    return NextResponse.json({ success: true, data: photo }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Erreur lors de l'ajout de la photo." }, { status: 500 });
  }
}
