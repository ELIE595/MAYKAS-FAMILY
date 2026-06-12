import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/membres/[id] — profil complet d'un membre
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const membre = await prisma.membre.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { createdAt: "desc" } },
        evenements: { orderBy: { date: "desc" } },
        relationsA: { include: { membreB: true } },
        relationsB: { include: { membreA: true } },
      },
    });

    if (!membre) {
      return NextResponse.json(
        { success: false, error: "Membre introuvable." },
        { status: 404 }
      );
    }

    // Construire les listes père / mère / conjoint(s) / enfants / fratrie
    const pere = membre.relationsB
      .filter((r) => r.type === "PARENT_ENFANT" && r.membreA.sexe === "HOMME")
      .map((r) => r.membreA)[0];

    const mere = membre.relationsB
      .filter((r) => r.type === "PARENT_ENFANT" && r.membreA.sexe === "FEMME")
      .map((r) => r.membreA)[0];

    const enfants = membre.relationsA
      .filter((r) => r.type === "PARENT_ENFANT")
      .map((r) => r.membreB);

    const conjoints = [
      ...membre.relationsA.filter((r) => r.type === "CONJOINT").map((r) => r.membreB),
      ...membre.relationsB.filter((r) => r.type === "CONJOINT").map((r) => r.membreA),
    ];

    const { motDePasseHash: _hash, relationsA: _ra, relationsB: _rb, ...profil } = membre;

    return NextResponse.json({
      success: true,
      data: {
        ...profil,
        pere: pere || null,
        mere: mere || null,
        conjoints,
        enfants,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération du profil." },
      { status: 500 }
    );
  }
}

// PATCH /api/membres/[id] — mise à jour du profil
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // Champs autorisés à la mise à jour (whitelist de sécurité)
    const champsAutorises = [
      "nom", "postNom", "prenom", "sexe", "dateNaissance", "lieuNaissance",
      "nationalite", "pays", "ville", "adresse", "telephonePrincipal",
      "telephoneSecondaire", "profession", "entreprise", "etudes",
      "situationMatrimoniale", "biographie", "hobbies", "siteWeb",
      "reseauxSociaux", "photoProfilUrl", "banniereUrl", "latitude", "longitude",
    ];

    const data: Record<string, unknown> = {};
    for (const champ of champsAutorises) {
      if (champ in body) {
        data[champ] = champ === "dateNaissance" && body[champ]
          ? new Date(body[champ])
          : body[champ];
      }
    }

    const membreMisAJour = await prisma.membre.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: membreMisAJour });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour du profil." },
      { status: 500 }
    );
  }
}
