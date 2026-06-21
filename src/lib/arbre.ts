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

export async function construireArbreGenealogique(): Promise<NoeudArbre[]> {
  const membres: MembreAvecRelations[] = await prisma.membre.findMany({
    include: { relationsA: true, relationsB: true },
  });

  const parId = new Map(membres.map((m) => [m.id, m]));

  // Collect all relation data in flat arrays for fast lookup
  const toutesRelations: RelationFamiliale[] = membres.flatMap((m) => m.relationsA);

  function getEnfants(membreId: string): string[] {
    return toutesRelations
      .filter((r) => r.type === "PARENT_ENFANT" && r.membreAId === membreId)
      .map((r) => r.membreBId);
  }

  function getConjoints(membreId: string): string[] {
    const conjoints = new Set<string>();
    for (const rel of toutesRelations) {
      if (rel.type === "CONJOINT" && rel.statutActuel) {
        if (rel.membreAId === membreId) conjoints.add(rel.membreBId);
        if (rel.membreBId === membreId) conjoints.add(rel.membreAId);
      }
    }
    return Array.from(conjoints);
  }

  function aUnParent(membreId: string): boolean {
    return toutesRelations.some(
      (r) => r.type === "PARENT_ENFANT" && r.membreBId === membreId
    );
  }

  function estConjointDeQuelquun(membreId: string): boolean {
    return toutesRelations.some(
      (r) =>
        r.type === "CONJOINT" &&
        (r.membreAId === membreId || r.membreBId === membreId)
    );
  }

  const visites = new Set<string>();

  function construireNoeud(membreId: string): NoeudArbre | null {
    const membre = parId.get(membreId);
    if (!membre || visites.has(membreId)) return null;
    visites.add(membreId);

    // Marquer les conjoints comme visités pour qu'ils n'apparaissent pas en tant que racines
    const conjointsIds = getConjoints(membreId);
    conjointsIds.forEach((cid) => visites.add(cid));

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

  // Racines = membres sans parent ET qui ne sont pas uniquement conjoint d'un autre
  // Priorité : génération 0 d'abord, puis HOMME avant FEMME pour éviter doublons conjoints
  const candidatsRacines = membres
    .filter((m) => !aUnParent(m.id))
    .sort((a, b) => {
      if (a.generation !== b.generation) return a.generation - b.generation;
      // Homme en premier dans un couple pour éviter doublon
      if (a.sexe === "HOMME" && b.sexe === "FEMME") return -1;
      if (a.sexe === "FEMME" && b.sexe === "HOMME") return 1;
      return 0;
    });

  const racines = candidatsRacines
    .map((m) => construireNoeud(m.id))
    .filter((n): n is NoeudArbre => n !== null);

  return racines;
}
