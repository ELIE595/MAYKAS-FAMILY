"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, User, X } from "lucide-react";
import type { MembreResume } from "@/types";

export default function PageRecherche() {
  const [requete, setRequete] = useState("");
  const [resultats, setResultats] = useState<MembreResume[]>([]);
  const [recherche, setRecherche] = useState(false);
  const [aRecherche, setARecherche] = useState(false);

  async function lancerRecherche(e: React.FormEvent) {
    e.preventDefault();
    if (!requete.trim()) return;

    setRecherche(true);
    setARecherche(true);
    try {
      const res = await fetch(`/api/membres?q=${encodeURIComponent(requete)}`);
      const data = await res.json();
      if (data.success) setResultats(data.data);
    } finally {
      setRecherche(false);
    }
  }

  function reinitialiser() {
    setRequete("");
    setResultats([]);
    setARecherche(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
          <Search size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Recherche</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Retrouvez un membre par nom, prénom ou ville</p>
        </div>
      </div>

      <form onSubmit={lancerRecherche} className="mb-6 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
          <Search size={16} className="text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={requete}
            onChange={(e) => setRequete(e.target.value)}
            placeholder="Nom, prénom, ville..."
            className="w-full bg-transparent text-sm outline-none"
          />
          {requete && (
            <button type="button" onClick={reinitialiser}>
              <X size={15} className="text-[var(--color-text-muted)]" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
        >
          Rechercher
        </button>
      </form>

      {recherche && <p className="text-center text-sm text-[var(--color-text-muted)]">Recherche en cours...</p>}

      {!recherche && aRecherche && resultats.length === 0 && (
        <p className="text-center text-sm text-[var(--color-text-muted)]">Aucun résultat trouvé.</p>
      )}

      {resultats.length > 0 && (
        <div className="space-y-2">
          {resultats.map((m) => (
            <Link
              key={m.id}
              href={`/profil/${m.id}`}
              className="card flex items-center gap-3 p-4 transition hover:bg-[var(--color-gold-light)]/20"
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[var(--color-gold-light)]">
                {m.photoProfilUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photoProfilUrl} alt={m.prenom} className="h-full w-full object-cover" />
                ) : (
                  <User size={20} className="text-[var(--color-primary)]" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">{m.prenom} {m.nom} {m.postNom || ""}</p>
                {m.ville && <p className="text-xs text-[var(--color-text-muted)]">{m.ville}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
