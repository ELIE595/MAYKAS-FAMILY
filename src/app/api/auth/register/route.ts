import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashMotDePasse, genererToken } from "@/lib/auth";
import { z } from "zod";

const inscriptionSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(6),
  nom: z.string().min(1),
  postNom: z.string().optional(),
  prenom: z.string().min(1),
  sexe: z.enum(["HOMME", "FEMME"]),
  dateNaissance: z.string().optional(),
  lieuNaissance: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  telephonePrincipal: z.string().optional(),
  situationMatrimoniale: z.enum(["CELIBATAIRE", "MARIE", "DIVORCE", "VEUF", "CONCUBINAGE"]).optional(),
});

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = inscriptionSchema.parse(body);

    // Vérifier si l'email est déjà utilisé
    const emailExistant = await prisma.membre.findUnique({ where: { email: data.email } });
    if (emailExistant) {
      return NextResponse.json(
        { success: false, error: "Cet email est déjà utilisé." },
        { status: 409 }
      );
    }

    const motDePasseHash = await hashMotDePasse(data.motDePasse);

    const membre = await prisma.membre.create({
      data: {
        email: data.email,
        motDePasseHash,
        nom: data.nom,
        postNom: data.postNom,
        prenom: data.prenom,
        sexe: data.sexe,
        dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : null,
        lieuNaissance: data.lieuNaissance,
        ville: data.ville,
        pays: data.pays,
        telephonePrincipal: data.telephonePrincipal,
        situationMatrimoniale: data.situationMatrimoniale,
        statutCompte: "ACTIF",
        generation: 1,
      },
    });

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
