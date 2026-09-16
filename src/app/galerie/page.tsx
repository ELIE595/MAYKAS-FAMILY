"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Plus, X, Download } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  legende: string | null;
  album: string | null;
  membreId: string;
  membre?: { prenom: string; nom: string };
}

export default function PageGalerie() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albumActif, setAlbumActif] = useState<string>("Toutes");
  const [photoSelectionnee, setPhotoSelectionnee] = useState<Photo | null>(null);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [form, setForm] = useState({ url: "", legende: "", album: "Famille", membreId: "" });
  const [membres, setMembres] = useState<{ id: string; prenom: string; nom: string }[]>([]);
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces] = useState("");

  useEffect(() => {
    chargerPhotos();
    chargerMembres();
  }, []);

  async function chargerPhotos() {
    try {
      const res = await fetch("/api/photos");
      const data = await res.json();
      if (data.success) setPhotos(data.data);
    } catch {
      console.error("Erreur chargement photos");
    }
  }

  async function chargerMembres() {
    try {
      const res = await fetch("/api/membres");
      const data = await res.json();
      if (data.success) setMembres(data.data);
    } catch {
      console.error("Erreur chargement membres");
    }
  }

  const albums = ["Toutes", ...Array.from(new Set(photos.map((p) => p.album || "Sans album")))];
  const photosFiltrees = albumActif === "Toutes"
    ? photos
    : photos.filter((p) => (p.album || "Sans album") === albumActif);

  async function ajouterPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!form.url || !form.membreId) return;
    setChargement(true);
    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSucces("Photo ajoutée !");
        setForm({ url: "", legende: "", album: "Famille", membreId: "" });
        setAfficherFormulaire(false);
        chargerPhotos();
        setTimeout(() => setSucces(""), 3000);
      }
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
            <ImageIcon size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Galerie familiale</h1>
            <p className="text-sm text-[var(--color-text-muted)]">{photos.length} photo(s) partagée(s)</p>
          </div>
        </div>
        <button
          onClick={() => setAfficherFormulaire(!afficherFormulaire)}
          className="flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary-dark)]"
        >
          <Plus size={16} /> Ajouter une photo
        </button>
      </div>

      {succes && <p className="mb-4 text-sm text-green-600">{succes}</p>}

      {/* Formulaire ajout */}
      {afficherFormulaire && (
        <div className="card mb-6 p-6">
          <h2 className="mb-4 font-semibold text-[var(--color-text)]">Ajouter une photo</h2>
          <form onSubmit={ajouterPhoto} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">URL de la photo</label>
              <input
                type="url" required value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://..."
                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Album</label>
              <input
                type="text" value={form.album}
                onChange={(e) => setForm((f) => ({ ...f, album: e.target.value }))}
                placeholder="Famille, Mariage, Naissance..."
                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Légende (optionnel)</label>
              <input
                type="text" value={form.legende}
                onChange={(e) => setForm((f) => ({ ...f, legende: e.target.value }))}
                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Membre concerné</label>
              <select
                required value={form.membreId}
                onChange={(e) => setForm((f) => ({ ...f, membreId: e.target.value }))}
                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Choisir un membre...</option>
                {membres.map((m) => (
                  <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setAfficherFormulaire(false)}
                className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={chargement}
                className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {chargement ? "Ajout..." : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres albums */}
      <div className="mb-4 flex flex-wrap gap-2">
        {albums.map((album) => (
          <button
            key={album}
            onClick={() => setAlbumActif(album)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              albumActif === album
                ? "bg-[var(--color-primary)] text-white"
                : "border border-[var(--color-border)] text-[var(--color-text-muted)]"
            }`}
          >
            {album}
          </button>
        ))}
      </div>

      {/* Grille de photos */}
      {photosFiltrees.length === 0 ? (
        <div className="card p-12 text-center text-[var(--color-text-muted)]">
          <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune photo pour le moment.</p>
          <p className="text-sm">Cliquez sur &quot;Ajouter une photo&quot; pour commencer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photosFiltrees.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setPhotoSelectionnee(photo)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-[var(--color-border)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.legende || ""}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
              {photo.legende && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-2">
                  <p className="text-xs text-white">{photo.legende}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {photoSelectionnee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPhotoSelectionnee(null)}
        >
          <div className="relative max-h-[90vh] max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPhotoSelectionnee(null)}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-lg"
            >
              <X size={16} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoSelectionnee.url}
              alt={photoSelectionnee.legende || ""}
              className="max-h-[80vh] rounded-xl object-contain"
            />
            {photoSelectionnee.legende && (
              <p className="mt-2 text-center text-sm text-white">{photoSelectionnee.legende}</p>
            )}
            <a
              href={photoSelectionnee.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-1 text-xs text-white/70 hover:text-white"
            >
              <Download size={14} /> Télécharger
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
