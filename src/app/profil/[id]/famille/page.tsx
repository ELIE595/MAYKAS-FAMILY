"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Baby, UserPlus } from "lucide-react";

interface NouveauMembre {
  prenom: string;
  nom: string;
  postNom: string;
  sexe: "HOMME" | "FEMME";
  dateNaissance: string;
}

const MEMBRE_VIDE: NouveauMembre = {
  prenom: "", nom: "", postNom: "", sexe: "HOMME", dateNaissance: "",
};

export default function PageGererFamille() {
  const params = useParams();
  const id = params.id as string;

  const [membre, setMembre] = useState<{ prenom: string; nom: string; generation: number } | null>(null);
  const [ongletActif, setOngletActif] = useState<"conjoint" | "enfant">("conjoint");

  const [formConjoint, setFormConjoint] = useState<NouveauMembre>(MEMBRE_VIDE);
  const [formEnfant, setFormEnfant] = useState<NouveauMembre>(MEMBRE_VIDE);

  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  useEffect(() => {
    fetch(`/api/membres/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMembre(data.data);
      });
  }, [id]);

  async function ajouterConjoint(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    setSucces("");

    try {
      const resMembre = await fetch("/api/membres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formConjoint,
          generation: membre?.generation ?? 1,
        }),
      });
      const dataMembre = await resMembre.json();
      if (!dataMembre.success) {
        setErreur(dataMembre.error || "Erreur lors de la création du conjoint.");
        return;
      }

      const resRelation = await fetch("/api/relations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membreAId: id,
          membreBId: dataMembre.data.id,
          type: "CONJOINT",
        }),
      });
      const dataRelation = await resRelation.json();
      if (!dataRelation.success) {
        setErreur(dataRelation.error || "Erreur lors de la création du lien conjugal.");
        return;
      }

      setSucces(`${formConjoint.prenom} a été ajouté(e) comme conjoint(e) !`);
      setFormConjoint(MEMBRE_VIDE);
    } catch {
      setErreur("Une erreur est survenue.");
    } finally {
      setChargement(false);
    }
  }

  async function ajouterEnfant(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    setSucces("");

    try {
      const res = await fetch("/api/membres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formEnfant,
          generation: (membre?.generation ?? 0) + 1,
          parentId: id,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setErreur(data.error || "Erreur lors de l'ajout de l'enfant.");
        return;
      }

      setSucces(`${formEnfant.prenom} a été ajouté(e) comme enfant !`);
      setFormEnfant(MEMBRE_VIDE);
    } catch {
      setErreur("Une erreur est survenue.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <Link href={`/profil/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
        <ArrowLeft size={15} /> Retour au profil
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-[var(--color-text)]">Gérer ma famille</h1>
      {membre && (
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          Ajoutez un conjoint ou un enfant au profil de {membre.prenom}.
        </p>
      )}

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setOngletActif("conjoint")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition ${
            ongletActif === "conjoint"
              ? "bg-[var(--color-primary)] text-white"
              : "border border-[var(--color-border)] text-[var(--color-text-muted)]"
          }`}
        >
          <Heart size={15} /> Ajouter un conjoint
        </button>
        <button
          onClick={() => setOngletActif("enfant")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition ${
            ongletActif === "enfant"
              ? "bg-[var(--color-primary)] text-white"
              : "border border-[var(--color-border)] text-[var(--color-text-muted)]"
          }`}
        >
          <Baby size={15} /> Ajouter un enfant
        </button>
      </div>

      {erreur && <p className="mb-4 text-sm text-red-600">{erreur}</p>}
      {succes && <p className="mb-4 text-sm text-green-600">{succes}</p>}

      {ongletActif === "conjoint" ? (
        <form onSubmit={ajouterConjoint} className="card space-y-4 p-6">
          <FormulaireMembre form={formConjoint} setForm={setFormConjoint} />
          <button
            type="submit"
            disabled={chargement}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
          >
            <Heart size={16} />
            {chargement ? "Ajout en cours..." : "Ajouter ce conjoint"}
          </button>
        </form>
      ) : (
        <form onSubmit={ajouterEnfant} className="card space-y-4 p-6">
          <FormulaireMembre form={formEnfant} setForm={setFormEnfant} />
          <button
            type="submit"
            disabled={chargement}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
          >
            <UserPlus size={16} />
            {chargement ? "Ajout en cours..." : "Ajouter cet enfant"}
          </button>
        </form>
      )}
    </div>
  );
}

function FormulaireMembre({
  form, setForm,
}: {
  form: NouveauMembre; setForm: React.Dispatch<React.SetStateAction<NouveauMembre>>;
}) {
  function maj(champ: keyof NouveauMembre, valeur: string) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Prénom</label>
          <input
            type="text" required value={form.prenom}
            onChange={(e) => maj("prenom", e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Nom</label>
          <input
            type="text" required value={form.nom}
            onChange={(e) => maj("nom", e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Post-nom (optionnel)</label>
        <input
          type="text" value={form.postNom}
          onChange={(e) => maj("postNom", e.target.value)}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Sexe</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => maj("sexe", "HOMME")}
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
            onClick={() => maj("sexe", "FEMME")}
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
        <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Date de naissance (optionnel)</label>
        <input
          type="date" value={form.dateNaissance}
          onChange={(e) => maj("dateNaissance", e.target.value)}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
        />
      </div>
    </>
  );
}
