import { prisma } from "./prisma";
import type { NoeudArbre, MembreResume } from "@/types";
import type { Membre, RelationFamiliale } from "@prisma/client";

type MembreAvecRelations = Membre & {
  relationsA: RelationFamiliale[];
  relationsB: RelationFamiliale[];
};

function versResume(m: Membre): MembreResume {
  return {
    id: m.id,
    nom: m.nom,
    postNom: m.postNom,
    prenom: m.prenom,
    sexe: m.sexe,
    dateNaissance: m.dateNaissance ? m.dateNaissance.toISOString() : null,
    dateDeces: m.dateDeces ? m.dateDeces.toISOString() : null,
    estDecede: m.estDecede,
    photoProfilUrl: m.photoProfilUrl,
    ville: m.ville,
    profession: m.profession,
    generation: m.generation,
  };
}

/**
 * Construit l'arbre généalogique complet à partir de la base de données.
 * Démarre depuis les membres de génération 0 (les ancêtres fondateurs)
 * et descend récursivement via les relations PARENT_ENFANT et CONJOINT.
 */
export async function construireArbreGenealogique(): Promise<NoeudArbre[]> {
  const membres: MembreAvecRelations[] = await prisma.membre.findMany({
    include: {
      relationsA: true,
      relationsB: true,
    },
  });

  const parId = new Map(membres.map((m) => [m.id, m]));

  function getEnfants(membreId: string): string[] {
    const enfants = new Set<string>();
    for (const m of membres) {
      for (const rel of m.relationsA) {
        if (rel.type === "PARENT_ENFANT" && rel.membreAId === membreId) {
          enfants.add(rel.membreBId);
        }
      }
    }
    return Array.from(enfants);
  }

  function getConjoints(membreId: string): string[] {
    const conjoints = new Set<string>();
    for (const m of membres) {
      for (const rel of m.relationsA) {
        if (rel.type === "CONJOINT" && rel.statutActuel) {
          if (rel.membreAId === membreId) conjoints.add(rel.membreBId);
          if (rel.membreBId === membreId) conjoints.add(rel.membreAId);
        }
      }
    }
    return Array.from(conjoints);
  }

  const visites = new Set<string>();

  function construireNoeud(membreId: string): NoeudArbre | null {
    const membre = parId.get(membreId);
    if (!membre || visites.has(membreId)) return null;
    visites.add(membreId);

    const conjointsIds = getConjoints(membreId);
    const conjoints = conjointsIds
      .map((id) => parId.get(id))
      .filter((m): m is MembreAvecRelations => m !== undefined)
      .map((m) => versResume(m));

    const enfantsIds = getEnfants(membreId);
    const enfants = enfantsIds
      .map((id) => construireNoeud(id))
      .filter((n): n is NoeudArbre => n !== null);

    return {
      ...versResume(membre),
      conjoints,
      enfants,
    };
  }

  // Racines = ancêtres fondateurs (génération 0)
  const racines = membres
    .filter((m) => m.generation === 0)
    .map((m) => construireNoeud(m.id))
    .filter((n): n is NoeudArbre => n !== null);

  return racines;
}
