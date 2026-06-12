import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashMotDePasse } from "@/lib/auth";
import { z } from "zod";

const creationMembreSchema = z.object({
  nom: z.string().min(1),
  postNom: z.string().optional(),
  prenom: z.string().min(1),
  sexe: z.enum(["HOMME", "FEMME"]),
  email: z.string().email().optional(),
  motDePasse: z.string().min(6).optional(),
  dateNaissance: z.string().optional(),
  lieuNaissance: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  profession: z.string().optional(),
  biographie: z.string().optional(),
  parentId: z.string().optional(), // pour rattacher l'enfant à un parent existant
  generation: z.number().optional(),
});

// GET /api/membres — recherche & liste
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recherche = searchParams.get("q") || "";
  const ville = searchParams.get("ville") || undefined;
  const profession = searchParams.get("profession") || undefined;
  const generation = searchParams.get("generation");

  try {
    const membres = await prisma.membre.findMany({
      where: {
        AND: [
          recherche
            ? {
                OR: [
                  { nom: { contains: recherche, mode: "insensitive" } },
                  { prenom: { contains: recherche, mode: "insensitive" } },
                  { postNom: { contains: recherche, mode: "insensitive" } },
                ],
              }
            : {},
          ville ? { ville: { contains: ville, mode: "insensitive" } } : {},
          profession ? { profession: { contains: profession, mode: "insensitive" } } : {},
          generation ? { generation: Number(generation) } : {},
        ],
      },
      select: {
        id: true,
        nom: true,
        postNom: true,
        prenom: true,
        sexe: true,
        dateNaissance: true,
        dateDeces: true,
        estDecede: true,
        photoProfilUrl: true,
        ville: true,
        profession: true,
        generation: true,
      },
      orderBy: [{ generation: "asc" }, { nom: "asc" }],
    });

    return NextResponse.json({ success: true, data: membres });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des membres." },
      { status: 500 }
    );
  }
}

// POST /api/membres — création d'un nouveau membre (par un parent ou via inscription)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = creationMembreSchema.parse(body);

    const motDePasseHash = data.motDePasse
      ? await hashMotDePasse(data.motDePasse)
      : null;

    const nouveauMembre = await prisma.membre.create({
      data: {
        nom: data.nom,
        postNom: data.postNom,
        prenom: data.prenom,
        sexe: data.sexe,
        email: data.email,
        motDePasseHash,
        dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : null,
        lieuNaissance: data.lieuNaissance,
        ville: data.ville,
        pays: data.pays,
        profession: data.profession,
        biographie: data.biographie,
        generation: data.generation ?? 1,
        statutCompte: data.email ? "ACTIF" : "EN_ATTENTE",
      },
    });

    // Si un parent est spécifié, créer la relation PARENT_ENFANT
    if (data.parentId) {
      await prisma.relationFamiliale.create({
        data: {
          membreAId: data.parentId,
          membreBId: nouveauMembre.id,
          type: "PARENT_ENFANT",
        },
      });

      // Notification au parent
      await prisma.notification.create({
        data: {
          type: "NOUVEAU_MEMBRE",
          message: `${data.prenom} ${data.nom} a été ajouté(e) à l'arbre familial.`,
          destinataireId: data.parentId,
        },
      });
    }

    return NextResponse.json({ success: true, data: nouveauMembre }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides.", details: error.issues },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création du membre." },
      { status: 500 }
    );
  }
}
