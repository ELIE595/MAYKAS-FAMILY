import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashMotDePasse, genererToken } from "@/lib/auth";
import { z } from "zod";

const inscriptionSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(6),
  // Si l'utilisateur réclame un profil existant créé par un parent
  profilExistantId: z.string().optional(),
  // Sinon, infos pour un nouveau profil
  nom: z.string().optional(),
  postNom: z.string().optional(),
  prenom: z.string().optional(),
  sexe: z.enum(["HOMME", "FEMME"]).optional(),
});

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = inscriptionSchema.parse(body);

    const motDePasseHash = await hashMotDePasse(data.motDePasse);

    let membre;

    if (data.profilExistantId) {
      // L'utilisateur réclame un profil créé par un parent (enfant devenu majeur)
      const profilExistant = await prisma.membre.findUnique({
        where: { id: data.profilExistantId },
      });

      if (!profilExistant) {
        return NextResponse.json(
          { success: false, error: "Profil introuvable." },
          { status: 404 }
        );
      }

      if (profilExistant.email) {
        return NextResponse.json(
          { success: false, error: "Ce profil est déjà associé à un compte." },
          { status: 409 }
        );
      }

      membre = await prisma.membre.update({
        where: { id: data.profilExistantId },
        data: {
          email: data.email,
          motDePasseHash,
          statutCompte: "ACTIF",
        },
      });
    } else {
      // Nouveau membre indépendant (un descendant qui crée son compte directement)
      if (!data.nom || !data.prenom || !data.sexe) {
        return NextResponse.json(
          { success: false, error: "Nom, prénom et sexe sont requis." },
          { status: 400 }
        );
      }

      const emailExistant = await prisma.membre.findUnique({
        where: { email: data.email },
      });
      if (emailExistant) {
        return NextResponse.json(
          { success: false, error: "Cet email est déjà utilisé." },
          { status: 409 }
        );
      }

      membre = await prisma.membre.create({
        data: {
          email: data.email,
          motDePasseHash,
          nom: data.nom,
          postNom: data.postNom,
          prenom: data.prenom,
          sexe: data.sexe,
          statutCompte: "ACTIF",
          generation: 1,
        },
      });
    }

    const token = genererToken({
      membreId: membre.id,
      role: membre.role,
      email: membre.email!,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          membre: { id: membre.id, nom: membre.nom, prenom: membre.prenom, role: membre.role },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides.", details: error.issues },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'inscription." },
      { status: 500 }
    );
  }
}
