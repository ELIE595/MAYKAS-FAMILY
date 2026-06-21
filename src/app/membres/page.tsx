import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { User, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PageMembres() {
  const membres = await prisma.membre.findMany({
    orderBy: [{ generation: "asc" }, { nom: "asc" }],
    select: {
      id: true, prenom: true, nom: true, postNom: true, ville: true,
      profession: true, photoProfilUrl: true, generation: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
          <Users size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Membres de la famille</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{membres.length} membre(s) enregistré(s)</p>
        </div>
      </div>

      {membres.length === 0 ? (
        <div className="card p-12 text-center text-[var(--color-text-muted)]">
          Aucun membre pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {membres.map((m) => (
            <Link
              key={m.id}
              href={`/profil/${m.id}`}
              className="card flex flex-col items-center p-4 text-center transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[var(--color-gold-light)]">
                {m.photoProfilUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photoProfilUrl} alt={m.prenom} className="h-full w-full object-cover" />
                ) : (
                  <User size={26} className="text-[var(--color-primary)]" />
                )}
              </div>
              <p className="text-sm font-semibold text-[var(--color-text)]">{m.prenom}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{m.nom} {m.postNom || ""}</p>
              {m.ville && <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{m.ville}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
