export type Sexe = "HOMME" | "FEMME";

export interface MembreResume {
  id: string;
  nom: string;
  postNom: string | null;
  prenom: string;
  sexe: Sexe;
  dateNaissance: string | null;
  dateDeces: string | null;
  estDecede: boolean;
  photoProfilUrl: string | null;
  ville: string | null;
  profession: string | null;
  generation: number;
}

export interface NoeudArbre extends MembreResume {
  conjoints: MembreResume[];
  enfants: NoeudArbre[];
}

export interface MembreComplet extends MembreResume {
  email: string | null;
  lieuNaissance: string | null;
  nationalite: string | null;
  pays: string | null;
  adresse: string | null;
  telephonePrincipal: string | null;
  telephoneSecondaire: string | null;
  entreprise: string | null;
  etudes: string | null;
  situationMatrimoniale: string | null;
  biographie: string | null;
  hobbies: string | null;
  siteWeb: string | null;
  reseauxSociaux: Record<string, string> | null;
  banniereUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  role: string;
  statutCompte: string;
}
