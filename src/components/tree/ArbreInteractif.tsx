"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { ZoomIn, ZoomOut, Maximize2, Search, RotateCcw } from "lucide-react";
import type { NoeudArbre } from "@/types";
import NoeudArbreComponent from "./NoeudArbre";

function aplatirArbre(noeuds: NoeudArbre[]): NoeudArbre[] {
  const resultat: NoeudArbre[] = [];
  function parcourir(liste: NoeudArbre[]) {
    for (const n of liste) {
      resultat.push(n);
      parcourir(n.enfants);
    }
  }
  parcourir(noeuds);
  return resultat;
}

export default function ArbreInteractif({ arbre }: { arbre: NoeudArbre[] }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [enGlissement, setEnGlissement] = useState(false);
  const [recherche, setRecherche] = useState("");
  const dernierePosition = useRef({ x: 0, y: 0 });
  const conteneurRef = useRef<HTMLDivElement>(null);

  const tousLesMembres = useMemo(() => aplatirArbre(arbre), [arbre]);

  const resultatsRecherche = useMemo(() => {
    if (!recherche.trim()) return [];
    const q = recherche.toLowerCase();
    return tousLesMembres.filter(
      (m) =>
        m.prenom.toLowerCase().includes(q) ||
        m.nom.toLowerCase().includes(q) ||
        (m.postNom && m.postNom.toLowerCase().includes(q))
    );
  }, [recherche, tousLesMembres]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setEnGlissement(true);
      dernierePosition.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    },
    [position]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enGlissement) return;
      setPosition({
        x: e.clientX - dernierePosition.current.x,
        y: e.clientY - dernierePosition.current.y,
      });
    },
    [enGlissement]
  );

  const onMouseUp = useCallback(() => setEnGlissement(false), []);

  const reinitialiser = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="relative h-[75vh] w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-cream)] to-[var(--color-gold-light)]/20">
      {/* Barre d'outils */}
      <div className="absolute left-4 top-4 z-20 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 shadow-sm">
          <Search size={15} className="text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-44 bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
          />
        </div>
        {resultatsRecherche.length > 0 && (
          <div className="max-h-40 w-56 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg">
            {resultatsRecherche.slice(0, 6).map((m) => (
              <a
                key={m.id}
                href={`/profil/${m.id}`}
                className="block px-3 py-2 text-sm hover:bg-[var(--color-gold-light)]/30"
              >
                {m.prenom} {m.nom} {m.postNom}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Contrôles zoom */}
      <div className="absolute right-4 top-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm transition hover:bg-[var(--color-gold-light)]/30"
          title="Zoom avant"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.3))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm transition hover:bg-[var(--color-gold-light)]/30"
          title="Zoom arrière"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={reinitialiser}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm transition hover:bg-[var(--color-gold-light)]/30"
          title="Réinitialiser la vue"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm transition hover:bg-[var(--color-gold-light)]/30"
          title="Vue complète"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Zone de l'arbre — drag & drop + zoom */}
      <div
        ref={conteneurRef}
        className={`h-full w-full ${enGlissement ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div
          className="flex h-full w-full items-start justify-center pt-16"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: "top center",
            transition: enGlissement ? "none" : "transform 0.15s ease-out",
          }}
        >
          <div className="flex gap-16 px-12 pb-20">
            {arbre.map((racine) => (
              <NoeudArbreComponent key={racine.id} noeud={racine} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
