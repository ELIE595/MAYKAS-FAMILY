import Link from "next/link";
import { TreePine, Users, Search, Image as ImageIcon, MapPin, Clock } from "lucide-react";

export default function PageAccueil() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[var(--color-forest)] px-6 py-24 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <TreePine size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Bienvenue dans la <span className="text-[var(--color-gold-light)]">Famille Maykas</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
            Notre histoire, nos racines, notre avenir — tous réunis dans un arbre
            généalogique vivant, depuis Mayombo Mwilu Muke et Kasongo Mbayo Bertha
            jusqu&apos;à aujourd&apos;hui.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/arbre"
              className="rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-dark)] shadow-lg transition hover:brightness-105"
            >
              Découvrir l&apos;arbre généalogique
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Rejoindre la famille
            </Link>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-[var(--color-text)]">
          Tout ce dont une famille a besoin
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Fonctionnalite
            icon={<TreePine />}
            titre="Arbre généalogique interactif"
            description="Zoomez, déplacez et explorez chaque génération, des ancêtres fondateurs aux plus jeunes membres."
          />
          <Fonctionnalite
            icon={<Users />}
            titre="Profils détaillés"
            description="Chaque membre dispose d'un profil complet : biographie, photos, informations familiales et professionnelles."
          />
          <Fonctionnalite
            icon={<Search />}
            titre="Recherche intelligente"
            description="Retrouvez un membre par nom, ville, profession ou génération en quelques secondes."
          />
          <Fonctionnalite
            icon={<ImageIcon />}
            titre="Galerie familiale"
            description="Partagez et conservez les photos et documents qui racontent notre histoire."
          />
          <Fonctionnalite
            icon={<MapPin />}
            titre="Cartographie familiale"
            description="Visualisez où vivent les membres de la famille à travers le monde."
          />
          <Fonctionnalite
            icon={<Clock />}
            titre="Timeline familiale"
            description="Naissances, mariages, diplômes — revivez les grands moments de notre histoire."
          />
        </div>
      </section>

      {/* Ancêtres fondateurs */}
      <section className="bg-[var(--color-forest)]/5 px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-2xl font-bold text-[var(--color-text)]">
            Nos ancêtres fondateurs
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="card p-6">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-light)]/20 text-[var(--color-primary)]">
                <Users size={28} />
              </div>
              <h3 className="text-lg font-semibold">Mayombo Mwilu Muke</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Arrière-grand-père</p>
            </div>
            <div className="card p-6">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-gold-light)] text-[var(--color-primary)]">
                <Users size={28} />
              </div>
              <h3 className="text-lg font-semibold">Kasongo Mbayo Bertha</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Arrière-grand-mère</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Fonctionnalite({
  icon,
  titre,
  description,
}: {
  icon: React.ReactNode;
  titre: string;
  description: string;
}) {
  return (
    <div className="card p-6">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
        {icon}
      </div>
      <h3 className="mb-1 font-semibold text-[var(--color-text)]">{titre}</h3>
      <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
    </div>
  );
}
