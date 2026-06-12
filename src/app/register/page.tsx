"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User } from "lucide-react";

export default function PageInscription() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    motDePasse: "",
    nom: "",
    postNom: "",
    prenom: "",
    sexe: "HOMME" as "HOMME" | "FEMME",
  });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  function majChamp(champ: string, valeur: string) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        setErreur(data.error || "Erreur lors de l'inscription.");
        return;
      }

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("membre", JSON.stringify(data.data.membre));
      router.push(`/profil/${data.data.membre.id}`);
    } catch {
      setErreur("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white">
        <UserPlus size={22} />
      </div>
      <h1 className="mb-1 text-2xl font-bold text-[var(--color-text)]">Rejoindre la famille</h1>
      <p className="mb-6 text-center text-sm text-[var(--color-text-muted)]">
        Créez votre compte pour apparaître dans l&apos;arbre généalogique et gérer votre profil.
      </p>

      <form onSubmit={gererSoumission} className="w-full space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Champ label="Prénom" value={form.prenom} onChange={(v) => majChamp("prenom", v)} required icon={<User size={16} />} />
          <Champ label="Nom" value={form.nom} onChange={(v) => majChamp("nom", v)} required />
        </div>
        <Champ label="Post-nom" value={form.postNom} onChange={(v) => majChamp("postNom", v)} />

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Sexe</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => majChamp("sexe", "HOMME")}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm transition ${
                form.sexe === "HOMME"
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
            >
              Homme
            </button>
            <button
              type="button"
              onClick={() => majChamp("sexe", "FEMME")}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm transition ${
                form.sexe === "FEMME"
                  ? "border-[var(--color-gold)] bg-[var(--color-gold-light)]/40 text-[var(--color-primary-dark)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
            >
              Femme
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Email</label>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5">
            <Mail size={16} className="text-[var(--color-text-muted)]" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => majChamp("email", e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="vous@exemple.com"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Mot de passe</label>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5">
            <Lock size={16} className="text-[var(--color-text-muted)]" />
            <input
              type="password"
              required
              minLength={6}
              value={form.motDePasse}
              onChange={(e) => majChamp("motDePasse", e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Au moins 6 caractères"
            />
          </div>
        </div>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        <button
          type="submit"
          disabled={chargement}
          className="w-full rounded-full bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
        >
          {chargement ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--color-text-muted)]">
        Déjà membre ?{" "}
        <Link href="/login" className="font-medium text-[var(--color-primary)]">
          Connectez-vous
        </Link>
      </p>
    </div>
  );
}

function Champ({
  label, value, onChange, required, icon,
}: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5">
        {icon && <span className="text-[var(--color-text-muted)]">{icon}</span>}
        <input
          type="text"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}
