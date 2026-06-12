import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  User, MapPin, Briefcase, Phone, Mail, Calendar, Heart,
  Users, GraduationCap, Globe, ArrowLeft,
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export default async function PageProfil({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const membre = await prisma.membre.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { createdAt: "desc" }, take: 8 },
      evenements: { orderBy: { date: "desc" } },
      relationsA: { include: { membreB: true } },
      relationsB: { include: { membreA: true } },
    },
  });

  if (!membre) notFound();

  const pere = membre.relationsB.find((r) => r.type === "PARENT_ENFANT" && r.membreA.sexe === "HOMME")?.membreA;
  const mere = membre.relationsB.find((r) => r.type === "PARENT_ENFANT" && r.membreA.sexe === "FEMME")?.membreA;
  const enfants = membre.relationsA.filter((r) => r.type === "PARENT_ENFANT").map((r) => r.membreB);
  const conjoints = [
    ...membre.relationsA.filter((r) => r.type === "CONJOINT").map((r) => r.membreB),
    ...membre.relationsB.filter((r) => r.type === "CONJOINT").map((r) => r.membreA),
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/arbre" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
        <ArrowLeft size={15} /> Retour à l&apos;arbre
      </Link>

      {/* Bannière */}
      <div className="relative mb-16 h-48 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-gold)] sm:h-64">
        {membre.banniereUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={membre.banniereUrl} alt="" className="h-full w-full object-cover" />
        )}

        {/* Photo de profil */}
        <div className="absolute -bottom-12 left-6 h-28 w-28 overflow-hidden rounded-full border-4 border-[var(--color-cream)] bg-[var(--color-gold-light)] shadow-lg sm:h-32 sm:w-32">
          {membre.photoProfilUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={membre.photoProfilUrl} alt={membre.prenom} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--color-primary)]">
              <User size={48} />
            </div>
          )}
        </div>
      </div>

      {/* En-tête identité */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 px-2">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {membre.prenom} {membre.nom} {membre.postNom}
          </h1>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-muted)]">
            {membre.profession && (
              <span className="flex items-center gap-1"><Briefcase size={14} /> {membre.profession}</span>
            )}
            {membre.ville && (
              <span className="flex items-center gap-1"><MapPin size={14} /> {membre.ville}{membre.pays ? `, ${membre.pays}` : ""}</span>
            )}
            <span className="flex items-center gap-1"><Calendar size={14} /> Né(e) le {formatDate(membre.dateNaissance)}</span>
          </div>
        </div>
        <Link
          href={`/profil/${membre.id}/modifier`}
          className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary-dark)]"
        >
          Modifier le profil
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">
          {/* Biographie */}
          <section className="card p-6">
            <h2 className="mb-3 font-semibold text-[var(--color-text)]">À propos</h2>
            <p className="whitespace-pre-line text-sm text-[var(--color-text-muted)]">
              {membre.biographie || "Aucune biographie renseignée pour le moment."}
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {membre.etudes && (
                <Info icon={<GraduationCap size={15} />} label="Études" value={membre.etudes} />
              )}
              {membre.entreprise && (
                <Info icon={<Briefcase size={15} />} label="Entreprise" value={membre.entreprise} />
              )}
              {membre.hobbies && (
                <Info icon={<Heart size={15} />} label="Centres d'intérêt" value={membre.hobbies} />
              )}
              {membre.siteWeb && (
                <Info icon={<Globe size={15} />} label="Site web" value={membre.siteWeb} />
              )}
            </div>
          </section>

          {/* Galerie */}
          <section className="card p-6">
            <h2 className="mb-3 font-semibold text-[var(--color-text)]">Galerie familiale</h2>
            {membre.photos.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">Aucune photo pour le moment.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {membre.photos.map((photo) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt={photo.legende || ""}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </section>

          {/* Timeline */}
          <section className="card p-6">
            <h2 className="mb-3 font-semibold text-[var(--color-text)]">Timeline familiale</h2>
            {membre.evenements.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">Aucun événement enregistré.</p>
            ) : (
              <ul className="space-y-3">
                {membre.evenements.map((ev) => (
                  <li key={ev.id} className="flex gap-3 border-l-2 border-[var(--color-gold)] pl-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">{ev.titre}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{formatDate(ev.date)} {ev.lieu ? `· ${ev.lieu}` : ""}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Coordonnées */}
          <section className="card p-6">
            <h2 className="mb-3 font-semibold text-[var(--color-text)]">Coordonnées</h2>
            <div className="space-y-2 text-sm">
              {membre.email && (
                <p className="flex items-center gap-2 text-[var(--color-text-muted)]"><Mail size={14} /> {membre.email}</p>
              )}
              {membre.telephonePrincipal && (
                <p className="flex items-center gap-2 text-[var(--color-text-muted)]"><Phone size={14} /> {membre.telephonePrincipal}</p>
              )}
              {membre.adresse && (
                <p className="flex items-center gap-2 text-[var(--color-text-muted)]"><MapPin size={14} /> {membre.adresse}</p>
              )}
            </div>
          </section>

          {/* Famille */}
          <section className="card p-6">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-[var(--color-text)]">
              <Users size={16} /> Liens familiaux
            </h2>

            {pere && <LienFamilial label="Père" membre={pere} />}
            {mere && <LienFamilial label="Mère" membre={mere} />}
            {conjoints.map((c) => (
              <LienFamilial key={c.id} label="Conjoint(e)" membre={c} />
            ))}
            {enfants.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">Enfants</p>
                <div className="flex flex-wrap gap-2">
                  {enfants.map((e) => (
                    <Link key={e.id} href={`/profil/${e.id}`} className="rounded-full bg-[var(--color-gold-light)]/50 px-3 py-1 text-xs text-[var(--color-text)] hover:bg-[var(--color-gold-light)]">
                      {e.prenom}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!pere && !mere && conjoints.length === 0 && enfants.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">Aucun lien familial enregistré.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-[var(--color-cream)] p-2.5">
      <span className="mt-0.5 text-[var(--color-primary)]">{icon}</span>
      <div>
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
        <p className="text-sm font-medium text-[var(--color-text)]">{value}</p>
      </div>
    </div>
  );
}

function LienFamilial({ label, membre }: { label: string; membre: { id: string; prenom: string; nom: string } }) {
  return (
    <Link href={`/profil/${membre.id}`} className="mb-2 flex items-center justify-between rounded-lg p-2 text-sm transition hover:bg-[var(--color-cream)]">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="font-medium text-[var(--color-text)]">{membre.prenom} {membre.nom}</span>
    </Link>
  );
}
