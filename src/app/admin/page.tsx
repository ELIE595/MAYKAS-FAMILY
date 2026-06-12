import { prisma } from "@/lib/prisma";
import { Users, ShieldAlert, Image as ImageIcon, TreePine } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PageAdmin() {
  const [totalMembres, totalEnAttente, totalPhotos, totalSignalements] = await Promise.all([
    prisma.membre.count(),
    prisma.membre.count({ where: { statutCompte: "EN_ATTENTE" } }),
    prisma.photo.count(),
    prisma.signalement.count({ where: { traite: false } }),
  ]);

  const dernieresGenerations = await prisma.membre.groupBy({
    by: ["generation"],
    _count: { _all: true },
    orderBy: { generation: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-[var(--color-text)]">Administration</h1>
      <p className="mb-6 text-sm text-[var(--color-text-muted)]">
        Statistiques familiales et gestion de la plateforme.
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Users />} label="Membres enregistrés" valeur={totalMembres} couleur="primary" />
        <Stat icon={<TreePine />} label="Profils en attente de réclamation" valeur={totalEnAttente} couleur="gold" />
        <Stat icon={<ImageIcon />} label="Photos partagées" valeur={totalPhotos} couleur="forest" />
        <Stat icon={<ShieldAlert />} label="Signalements à traiter" valeur={totalSignalements} couleur="primary" />
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-semibold text-[var(--color-text)]">Membres par génération</h2>
        <div className="space-y-2">
          {dernieresGenerations.map((g) => (
            <div key={g.generation} className="flex items-center gap-3">
              <span className="w-28 text-sm text-[var(--color-text-muted)]">Génération {g.generation}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full bg-[var(--color-primary)]"
                  style={{ width: `${Math.min(100, g._count._all * 10)}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm font-medium text-[var(--color-text)]">{g._count._all}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, valeur, couleur }: { icon: React.ReactNode; label: string; valeur: number; couleur: "primary" | "gold" | "forest" }) {
  const couleurs = {
    primary: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    gold: "bg-[var(--color-gold-light)] text-[var(--color-primary-dark)]",
    forest: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]",
  };
  return (
    <div className="card p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${couleurs[couleur]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-[var(--color-text)]">{valeur}</p>
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}
