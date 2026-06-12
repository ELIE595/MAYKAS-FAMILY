import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifierMotDePasse, genererToken } from "@/lib/auth";
import { z } from "zod";

const connexionSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(1),
});

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, motDePasse } = connexionSchema.parse(body);

    const membre = await prisma.membre.findUnique({ where: { email } });

    if (!membre || !membre.motDePasseHash) {
      return NextResponse.json(
        { success: false, error: "Identifiants incorrects." },
        { status: 401 }
      );
    }

    if (membre.statutCompte === "SUSPENDU") {
      return NextResponse.json(
        { success: false, error: "Ce compte a été suspendu." },
        { status: 403 }
      );
    }

    const motDePasseValide = await verifierMotDePasse(motDePasse, membre.motDePasseHash);
    if (!motDePasseValide) {
      return NextResponse.json(
        { success: false, error: "Identifiants incorrects." },
        { status: 401 }
      );
    }

    const token = genererToken({
      membreId: membre.id,
      role: membre.role,
      email: membre.email!,
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        membre: {
          id: membre.id,
          nom: membre.nom,
          prenom: membre.prenom,
          role: membre.role,
          photoProfilUrl: membre.photoProfilUrl,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la connexion." },
      { status: 500 }
    );
  }
}
