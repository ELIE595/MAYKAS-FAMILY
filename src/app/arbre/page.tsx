import { construireArbreGenealogique } from "@/lib/arbre";
import ArbreInteractif from "@/components/tree/ArbreInteractif";
import { TreePine } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PageArbre() {
  const arbre = await construireArbreGenealogique();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
          <TreePine size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Arbre généalogique</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Glissez pour vous déplacer, utilisez les boutons pour zoomer.
          </p>
        </div>
      </div>

      {arbre.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <TreePine size={40} className="text-[var(--color-gold)]" />
          <p className="text-[var(--color-text-muted)]">
            L&apos;arbre généalogique est vide. Exécutez le script de seed pour créer les
            ancêtres fondateurs.
          </p>
        </div>
      ) : (
        <ArbreInteractif arbre={arbre} />
      )}
    </div>
  );
}
