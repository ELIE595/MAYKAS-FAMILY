"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react";

export default function PageConnexion() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, motDePasse }),
      });
      const data = await res.json();

      if (!data.success) {
        setErreur(data.error || "Erreur de connexion.");
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
        <LogIn size={22} />
      </div>
      <h1 className="mb-1 text-2xl font-bold text-[var(--color-text)]">Connexion</h1>
      <p className="mb-6 text-sm text-[var(--color-text-muted)]">
        Accédez à votre profil et à l&apos;arbre familial.
      </p>

      <form onSubmit={gererSoumission} className="w-full space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Email</label>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5">
            <Mail size={16} className="text-[var(--color-text-muted)]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="••••••••"
            />
          </div>
        </div>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        <button
          type="submit"
          disabled={chargement}
          className="w-full rounded-full bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
        >
          {chargement ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--color-text-muted)]">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-[var(--color-primary)]">
          Inscrivez-vous
        </Link>
      </p>
    </div>
  );
}
