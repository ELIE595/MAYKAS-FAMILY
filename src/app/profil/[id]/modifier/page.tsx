"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface MembreEditable {
  nom: string;
  postNom: string;
  prenom: string;
  ville: string;
  pays: string;
  profession: string;
  entreprise: string;
  etudes: string;
  biographie: string;
  hobbies: string;
  siteWeb: string;
  telephonePrincipal: string;
  photoProfilUrl: string;
  banniereUrl: string;
}

const CHAMPS_VIDES: MembreEditable = {
  nom: "", postNom: "", prenom: "", ville: "", pays: "", profession: "",
  entreprise: "", etudes: "", biographie: "", hobbies: "", siteWeb: "",
  telephonePrincipal: "", photoProfilUrl: "", banniereUrl: "",
};

export default function PageModifierProfil() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<MembreEditable>(CHAMPS_VIDES);
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    async function charger() {
      try {
        const res = await fetch(`/api/membres/${id}`);
        const data = await res.json();
        if (data.success) {
          const m = data.data;
          setForm({
            nom: m.nom || "", postNom: m.postNom || "", prenom: m.prenom || "",
            ville: m.ville || "", pays: m.pays || "", profession: m.profession || "",
            entreprise: m.entreprise || "", etudes: m.etudes || "",
            biographie: m.biographie || "", hobbies: m.hobbies || "",
            siteWeb: m.siteWeb || "", telephonePrincipal: m.telephonePrincipal || "",
            photoProfilUrl: m.photoProfilUrl || "", banniereUrl: m.banniereUrl || "",
          });
        } else {
          setErreur("Profil introuvable.");
        }
      } catch {
        setErreur("Erreur lors du chargement du profil.");
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, [id]);

  function majChamp(champ: keyof MembreEditable, valeur: string) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setErreur("");
    setSucces(false);

    try {
      const res = await fetch(`/api/membres/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        setErreur(data.error || "Erreur lors de l'enregistrement.");
        return;
      }

      setSucces(true);
      setTimeout(() => router.push(`/profil/${id}`), 1000);
    } catch {
      setErreur("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setEnregistrement(false);
    }
  }

  if (chargement) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-[var(--color-text-muted)]">
        Chargement du profil...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href={`/profil/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
        <ArrowLeft size={15} /> Retour au profil
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-[var(--color-text)]">Modifier mon profil</h1>

      <form onSubmit={gererSoumission} className="space-y-6">
        <section className="card p-6">
          <h2 className="mb-4 font-semibold text-[var(--color-text)]">Identité</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Champ label="Prénom" value={form.prenom} onChange={(v) => majChamp("prenom", v)} />
            <Champ label="Nom" value={form.nom} onChange={(v) => majChamp("nom", v)} />
          </div>
          <div className="mt-4">
            <Champ label="Post-nom" value={form.postNom} onChange={(v) => majChamp("postNom", v)} />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-semibold text-[var(--color-text)]">Localisation</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Champ label="Ville" value={form.ville} onChange={(v) => majChamp("ville", v)} />
            <Champ label="Pays" value={form.pays} onChange={(v) => majChamp("pays", v)} />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-semibold text-[var(--color-text)]">Parcours</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Champ label="Profession" value={form.profession} onChange={(v) => majChamp("profession", v)} />
            <Champ label="Entreprise" value={form.entreprise} onChange={(v) => majChamp("entreprise", v)} />
          </div>
          <div className="mt-4">
            <Champ label="Études" value={form.etudes} onChange={(v) => majChamp("etudes", v)} />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-semibold text-[var(--color-text)]">À propos</h2>
          <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Biographie</label>
          <textarea
            value={form.biographie}
            onChange={(e) => majChamp("biographie", e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
            placeholder="Parlez un peu de vous..."
          />
          <div className="mt-4">
            <Champ label="Centres d'intérêt" value={form.hobbies} onChange={(v) => majChamp("hobbies", v)} />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-semibold text-[var(--color-text)]">Contact & médias</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Champ label="Téléphone" value={form.telephonePrincipal} onChange={(v) => majChamp("telephonePrincipal", v)} />
            <Champ label="Site web" value={form.siteWeb} onChange={(v) => majChamp("siteWeb", v)} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Champ label="URL photo de profil" value={form.photoProfilUrl} onChange={(v) => majChamp("photoProfilUrl", v)} placeholder="https://..." />
            <Champ label="URL bannière" value={form.banniereUrl} onChange={(v) => majChamp("banniereUrl", v)} placeholder="https://..." />
          </div>
        </section>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        {succes && <p className="text-sm text-green-600">Profil enregistré avec succès !</p>}

        <button
          type="submit"
          disabled={enregistrement}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
        >
          <Save size={16} />
          {enregistrement ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}

function Champ({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
      />
    </div>
  );
}
