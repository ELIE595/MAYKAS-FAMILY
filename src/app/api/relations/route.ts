import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const relationSchema = z.object({
  membreAId: z.string(),
  membreBId: z.string(),
  type: z.enum(["PARENT_ENFANT", "CONJOINT", "FRERE_SOEUR"]),
  dateDebut: z.string().optional(),
});

// POST /api/relations — ajouter un conjoint, un enfant, un frère/sœur, etc.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = relationSchema.parse(body);

    const relation = await prisma.relationFamiliale.create({
      data: {
        membreAId: data.membreAId,
        membreBId: data.membreBId,
        type: data.type,
        dateDebut: data.dateDebut ? new Date(data.dateDebut) : null,
      },
    });

    // Notification de mariage si type CONJOINT
    if (data.type === "CONJOINT") {
      await prisma.notification.createMany({
        data: [
          {
            type: "MARIAGE",
            message: "Un nouveau mariage a été enregistré dans la famille.",
            destinataireId: data.membreAId,
          },
          {
            type: "MARIAGE",
            message: "Un nouveau mariage a été enregistré dans la famille.",
            destinataireId: data.membreBId,
          },
        ],
      });
    }

    return NextResponse.json({ success: true, data: relation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides.", details: error.issues },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de la relation." },
      { status: 500 }
    );
  }
}
