import Link from "next/link";
import { User, Heart } from "lucide-react";
import type { MembreResume } from "@/types";

function calculerAge(dateNaissance: string | null, dateDeces: string | null): number | null {
  if (!dateNaissance) return null;
  const naissance = new Date(dateNaissance);
  const fin = dateDeces ? new Date(dateDeces) : new Date();
  let age = fin.getFullYear() - naissance.getFullYear();
  const m = fin.getMonth() - naissance.getMonth();
  if (m < 0 || (m === 0 && fin.getDate() < naissance.getDate())) age--;
  return age;
}

export default function CarteMembre({
  membre,
  estConjoint = false,
}: {
  membre: MembreResume;
  estConjoint?: boolean;
}) {
  const age = calculerAge(membre.dateNaissance, membre.dateDeces);
  const couleurBordure =
    membre.sexe === "HOMME" ? "border-[var(--color-primary-light)]" : "border-[var(--color-gold)]";

  return (
    <Link
      href={`/profil/${membre.id}`}
      className={`group flex w-44 flex-col items-center rounded-2xl border-2 ${couleurBordure} bg-[var(--color-card)] p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        estConjoint ? "opacity-90" : ""
      } ${membre.estDecede ? "grayscale" : ""}`}
    >
      <div className="relative mb-2 h-16 w-16 overflow-hidden rounded-full border-2 border-[var(--color-border)] bg-[var(--color-gold-light)]">
        {membre.photoProfilUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={membre.photoProfilUrl}
            alt={`${membre.prenom} ${membre.nom}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--color-primary)]">
            <User size={28} />
          </div>
        )}
        {estConjoint && (
          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-forest)] text-white">
            <Heart size={10} fill="white" />
          </div>
        )}
      </div>

      <p className="text-center text-sm font-semibold leading-tight text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
        {membre.prenom}
      </p>
      <p className="text-center text-xs leading-tight text-[var(--color-text-muted)]">
        {membre.nom} {membre.postNom || ""}
      </p>

      {(age !== null || membre.estDecede) && (
        <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
          {membre.estDecede ? `${age ? `${age} ans · ` : ""}†` : `${age} ans`}
        </p>
      )}

      {membre.profession && (
        <p className="mt-1 line-clamp-1 text-center text-[11px] text-[var(--color-forest)]">
          {membre.profession}
        </p>
      )}
    </Link>
  );
}
