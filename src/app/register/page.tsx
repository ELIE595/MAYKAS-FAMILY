"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, Heart, Baby, Plus, X, ChevronDown } from "lucide-react";

interface MembreSimple {
  id: string;
  prenom: string;
  nom: string;
  postNom: string | null;
}

interface Enfant {
  prenom: string;
  nom: string;
  postNom: string;
  sexe: "HOMME" | "FEMME";
  dateNaissance: string;
}

interface Conjoint {
  prenom: string;
  nom: string;
  postNom: string;
  sexe: "HOMME" | "FEMME";
  dateNaissance: string;
  email: string;
}

const ENFANT_VIDE: Enfant = { prenom: "", nom: "", postNom: "", sexe: "HOMME", dateNaissance: "" };
const CONJOINT_VIDE: Conjoint = { prenom: "", nom: "", postNom: "", sexe: "FEMME", dateNaissance: "", email: "" };

export default function PageInscription() {
  const router = useRouter();

  // Membres existants pour sélection père/mère
  const [membres, setMembres] = useState<MembreSimple[]>([]);

  // Formulaire principal
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    postNom: "",
    sexe: "HOMME" as "HOMME" | "FEMME",
    dateNaissance: "",
    lieuNaissance: "",
    ville: "",
    pays: "",
    telephone: "",
    email: "",
    motDePasse: "",
    pereId: "",
    mereId: "",
    situationMatrimoniale: "CELIBATAIRE" as "CELIBATAIRE" | "MARIE" | "DIVORCE" | "VEUF" | "CONCUBINAGE",
  });

  // Conjoint (si marié)
  const [ajouterConjoint, setAjouterConjoint] = useState(false);
  const [conjoint, setConjoint] = useState<Conjoint>(CONJOINT_VIDE);

  // Enfants
  const [enfants, setEnfants] = useState<Enfant[]>([]);

  const [etape, setEtape] = useState(1); // 1=identité, 2=famille, 3=compte
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    fetch("/api/membres")
      .then((r) => r.json())
      .then((data) => { if (data.success) setMembres(data.data); });
  }, []);

  function majForm(champ: string, valeur: string) {
    setForm((f) => ({ ...f, [champ]: valeur }));
    if (champ === "situationMatrimoniale") {
      setAjouterConjoint(valeur === "MARIE" || valeur === "CONCUBINAGE");
    }
  }

  function majConjoint(champ: string, valeur: string) {
    setConjoint((c) => ({ ...c, [champ]: valeur }));
  }

  function ajouterEnfant() {
    setEnfants((e) => [...e, { ...ENFANT_VIDE }]);
  }

  function majEnfant(index: number, champ: keyof Enfant, valeur: string) {
    setEnfants((e) => e.map((enfant, i) => i === index ? { ...enfant, [champ]: valeur } : enfant));
  }

  function supprimerEnfant(index: number) {
    setEnfants((e) => e.filter((_, i) => i !== index));
  }

  function nomMembre(m: MembreSimple) {
    return `${m.prenom} ${m.nom}${m.postNom ? " " + m.postNom : ""}`;
  }

  function validerEtape1() {
    if (!form.prenom || !form.nom || !form.sexe) {
      setErreur("Prénom, nom et sexe sont obligatoires.");
      return false;
    }
    setErreur("");
    return true;
  }

  function validerEtape2() {
    if (!form.pereId || !form.mereId) {
      setErreur("Vous devez sélectionner votre père ET votre mère pour être placé dans l'arbre généalogique.");
      return false;
    }
    if (form.pereId === form.mereId) {
      setErreur("Le père et la mère doivent être deux personnes différentes.");
      return false;
    }
    if (ajouterConjoint && (!conjoint.prenom || !conjoint.nom)) {
      setErreur("Renseignez le prénom et le nom de votre conjoint(e).");
      return false;
    }
    setErreur("");
    return true;
  }

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.motDePasse) {
      setErreur("Email et mot de passe sont obligatoires.");
      return;
    }
    if (form.motDePasse.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setChargement(true);
    setErreur("");

    try {
      // 1. Créer le compte du membre principal
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          motDePasse: form.motDePasse,
          nom: form.nom,
          postNom: form.postNom,
          prenom: form.prenom,
          sexe: form.sexe,
          dateNaissance: form.dateNaissance,
          lieuNaissance: form.lieuNaissance,
          ville: form.ville,
          pays: form.pays,
          telephonePrincipal: form.telephone,
          situationMatrimoniale: form.situationMatrimoniale,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErreur(data.error || "Erreur lors de la création du compte.");
        return;
      }

      const membreId = data.data.membre.id;

      // 2. Lier au père
      await fetch("/api/relations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membreAId: form.pereId, membreBId: membreId, type: "PARENT_ENFANT" }),
      });

      // 3. Lier à la mère
      await fetch("/api/relations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membreAId: form.mereId, membreBId: membreId, type: "PARENT_ENFANT" }),
      });

      // 4. Ajouter le conjoint si applicable
      if (ajouterConjoint && conjoint.prenom && conjoint.nom) {
        const resConj = await fetch("/api/membres", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prenom: conjoint.prenom,
            nom: conjoint.nom,
            postNom: conjoint.postNom,
            sexe: conjoint.sexe,
            dateNaissance: conjoint.dateNaissance,
            email: conjoint.email || undefined,
          }),
        });
        const dataConj = await resConj.json();
        if (dataConj.success) {
          await fetch("/api/relations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ membreAId: membreId, membreBId: dataConj.data.id, type: "CONJOINT" }),
          });
        }
      }

      // 5. Ajouter les enfants mineurs
      for (const enfant of enfants) {
        if (!enfant.prenom || !enfant.nom) continue;
        const resEnf = await fetch("/api/membres", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...enfant,
            parentId: membreId,
          }),
        });
        const dataEnf = await resEnf.json();
        if (dataEnf.success) {
          // Lier aussi à l'autre parent (conjoint) si ajouté
          // (déjà géré via parentId dans l'API membres)
        }
      }

      // 6. Sauvegarder le token et rediriger
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("membre", JSON.stringify(data.data.membre));
      router.push(`/profil/${membreId}`);

    } catch {
      setErreur("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      {/* En-tête */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white">
          <UserPlus size={22} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Rejoindre la famille</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Créez votre profil pour apparaître dans l&apos;arbre</p>
      </div>

      {/* Indicateur d'étapes */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
              etape === n ? "bg-[var(--color-primary)] text-white" :
              etape > n ? "bg-[var(--color-forest)] text-white" :
              "bg-[var(--color-border)] text-[var(--color-text-muted)]"
            }`}>
              {etape > n ? "✓" : n}
            </div>
            {n < 3 && <div className={`h-0.5 w-8 ${etape > n ? "bg-[var(--color-forest)]" : "bg-[var(--color-border)]"}`} />}
          </div>
        ))}
      </div>
      <div className="mb-6 flex justify-center gap-16 text-xs text-[var(--color-text-muted)]">
        <span className={etape === 1 ? "font-semibold text-[var(--color-primary)]" : ""}>Identité</span>
        <span className={etape === 2 ? "font-semibold text-[var(--color-primary)]" : ""}>Famille</span>
        <span className={etape === 3 ? "font-semibold text-[var(--color-primary)]" : ""}>Compte</span>
      </div>

      {erreur && <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{erreur}</p>}

      {/* ÉTAPE 1 — Identité */}
      {etape === 1 && (
        <div className="card space-y-4 p-6">
          <h2 className="font-semibold text-[var(--color-text)]">Vos informations personnelles</h2>

          <div className="grid grid-cols-2 gap-3">
            <Champ label="Prénom *" value={form.prenom} onChange={(v) => majForm("prenom", v)} />
            <Champ label="Nom *" value={form.nom} onChange={(v) => majForm("nom", v)} />
          </div>
          <Champ label="Post-nom" value={form.postNom} onChange={(v) => majForm("postNom", v)} />

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Sexe *</label>
            <div className="flex gap-2">
              {(["HOMME", "FEMME"] as const).map((s) => (
                <button key={s} type="button" onClick={() => majForm("sexe", s)}
                  className={`flex-1 rounded-xl border py-2 text-sm transition ${
                    form.sexe === s ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                  }`}>
                  {s === "HOMME" ? "Homme" : "Femme"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Date de naissance</label>
              <input type="date" value={form.dateNaissance} onChange={(e) => majForm("dateNaissance", e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none" />
            </div>
            <Champ label="Lieu de naissance" value={form.lieuNaissance} onChange={(v) => majForm("lieuNaissance", v)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Champ label="Ville actuelle" value={form.ville} onChange={(v) => majForm("ville", v)} />
            <Champ label="Pays" value={form.pays} onChange={(v) => majForm("pays", v)} />
          </div>

          <Champ label="Téléphone" value={form.telephone} onChange={(v) => majForm("telephone", v)} />

          <button onClick={() => { if (validerEtape1()) setEtape(2); }}
            className="w-full rounded-full bg-[var(--color-primary)] py-3 text-sm font-semibold text-white">
            Continuer →
          </button>
        </div>
      )}

      {/* ÉTAPE 2 — Famille */}
      {etape === 2 && (
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="mb-1 font-semibold text-[var(--color-text)]">Vos parents dans l&apos;arbre</h2>
            <p className="mb-4 text-xs text-[var(--color-text-muted)]">
              Sélectionnez votre père et votre mère parmi les membres déjà enregistrés.
              C&apos;est obligatoire pour être placé correctement dans l&apos;arbre généalogique.
            </p>

            <div className="space-y-3">
              <SelectMembre
                label="Père *"
                valeur={form.pereId}
                membres={membres.filter((m) => (m as any).sexe === "HOMME" || true)}
                onChange={(v) => majForm("pereId", v)}
                nomMembre={nomMembre}
              />
              <SelectMembre
                label="Mère *"
                valeur={form.mereId}
                membres={membres}
                onChange={(v) => majForm("mereId", v)}
                nomMembre={nomMembre}
              />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-3 font-semibold text-[var(--color-text)]">Situation matrimoniale</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { val: "CELIBATAIRE", label: "Célibataire" },
                { val: "MARIE", label: "Marié(e)" },
                { val: "CONCUBINAGE", label: "En couple" },
                { val: "DIVORCE", label: "Divorcé(e)" },
                { val: "VEUF", label: "Veuf/Veuve" },
              ].map(({ val, label }) => (
                <button key={val} type="button" onClick={() => majForm("situationMatrimoniale", val)}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${
                    form.situationMatrimoniale === val
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Conjoint */}
          {ajouterConjoint && (
            <div className="card p-6">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-[var(--color-text)]">
                <Heart size={16} className="text-[var(--color-primary)]" /> Conjoint(e)
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Champ label="Prénom *" value={conjoint.prenom} onChange={(v) => majConjoint("prenom", v)} />
                  <Champ label="Nom *" value={conjoint.nom} onChange={(v) => majConjoint("nom", v)} />
                </div>
                <Champ label="Post-nom" value={conjoint.postNom} onChange={(v) => majConjoint("postNom", v)} />
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Sexe</label>
                  <div className="flex gap-2">
                    {(["HOMME", "FEMME"] as const).map((s) => (
                      <button key={s} type="button" onClick={() => majConjoint("sexe", s)}
                        className={`flex-1 rounded-xl border py-2 text-sm transition ${
                          conjoint.sexe === s ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                          : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                        }`}>
                        {s === "HOMME" ? "Homme" : "Femme"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Date de naissance</label>
                  <input type="date" value={conjoint.dateNaissance} onChange={(e) => majConjoint("dateNaissance", e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none" />
                </div>
                <Champ label="Email du conjoint (optionnel — pour qu'il puisse créer son compte)" value={conjoint.email} onChange={(v) => majConjoint("email", v)} type="email" />
              </div>
            </div>
          )}

          {/* Enfants */}
          <div className="card p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-[var(--color-text)]">
                <Baby size={16} className="text-[var(--color-primary)]" /> Enfants mineurs
              </h2>
              <button type="button" onClick={ajouterEnfant}
                className="flex items-center gap-1 rounded-full bg-[var(--color-gold-light)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary-dark)]">
                <Plus size={13} /> Ajouter
              </button>
            </div>
            <p className="mb-3 text-xs text-[var(--color-text-muted)]">
              Ajoutez vos enfants mineurs ici. Quand ils seront majeurs, ils pourront réclamer leur profil.
            </p>

            {enfants.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">Aucun enfant ajouté pour le moment.</p>
            )}

            {enfants.map((enfant, i) => (
              <div key={i} className="mb-3 rounded-xl border border-[var(--color-border)] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-text)]">Enfant {i + 1}</span>
                  <button type="button" onClick={() => supprimerEnfant(i)}>
                    <X size={15} className="text-[var(--color-text-muted)]" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Champ label="Prénom *" value={enfant.prenom} onChange={(v) => majEnfant(i, "prenom", v)} />
                  <Champ label="Nom *" value={enfant.nom} onChange={(v) => majEnfant(i, "nom", v)} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Sexe</label>
                    <div className="flex gap-2">
                      {(["HOMME", "FEMME"] as const).map((s) => (
                        <button key={s} type="button" onClick={() => majEnfant(i, "sexe", s)}
                          className={`flex-1 rounded-xl border py-1.5 text-xs transition ${
                            enfant.sexe === s ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                            : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                          }`}>
                          {s === "HOMME" ? "H" : "F"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Date de naissance</label>
                    <input type="date" value={enfant.dateNaissance} onChange={(e) => majEnfant(i, "dateNaissance", e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] px-3 py-1.5 text-xs outline-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setEtape(1)}
              className="flex-1 rounded-full border border-[var(--color-border)] py-3 text-sm font-medium text-[var(--color-text-muted)]">
              ← Retour
            </button>
            <button onClick={() => { if (validerEtape2()) setEtape(3); }}
              className="flex-1 rounded-full bg-[var(--color-primary)] py-3 text-sm font-semibold text-white">
              Continuer →
            </button>
          </div>
        </div>
      )}

      {/* ÉTAPE 3 — Compte */}
      {etape === 3 && (
        <form onSubmit={gererSoumission} className="card space-y-4 p-6">
          <h2 className="font-semibold text-[var(--color-text)]">Créer votre compte</h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Ces identifiants vous permettront de vous connecter et de gérer votre profil.
          </p>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Email *</label>
            <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2.5">
              <Mail size={16} className="text-[var(--color-text-muted)]" />
              <input type="email" required value={form.email}
                onChange={(e) => majForm("email", e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full bg-transparent text-sm outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Mot de passe *</label>
            <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2.5">
              <Lock size={16} className="text-[var(--color-text-muted)]" />
              <input type="password" required minLength={6} value={form.motDePasse}
                onChange={(e) => majForm("motDePasse", e.target.value)}
                placeholder="Au moins 6 caractères"
                className="w-full bg-transparent text-sm outline-none" />
            </div>
          </div>

          {/* Résumé */}
          <div className="rounded-xl bg-[var(--color-gold-light)]/40 p-4 text-sm">
            <p className="mb-1 font-medium text-[var(--color-text)]">Récapitulatif</p>
            <p className="text-[var(--color-text-muted)]">{form.prenom} {form.nom} {form.postNom}</p>
            {form.pereId && <p className="text-[var(--color-text-muted)]">Père : {nomMembre(membres.find((m) => m.id === form.pereId)!)}</p>}
            {form.mereId && <p className="text-[var(--color-text-muted)]">Mère : {nomMembre(membres.find((m) => m.id === form.mereId)!)}</p>}
            {ajouterConjoint && conjoint.prenom && <p className="text-[var(--color-text-muted)]">Conjoint(e) : {conjoint.prenom} {conjoint.nom}</p>}
            {enfants.length > 0 && <p className="text-[var(--color-text-muted)]">{enfants.length} enfant(s) mineur(s)</p>}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setEtape(2)}
              className="flex-1 rounded-full border border-[var(--color-border)] py-3 text-sm font-medium text-[var(--color-text-muted)]">
              ← Retour
            </button>
            <button type="submit" disabled={chargement}
              className="flex-1 rounded-full bg-[var(--color-primary)] py-3 text-sm font-semibold text-white disabled:opacity-60">
              {chargement ? "Création..." : "Créer mon compte"}
            </button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
        Déjà membre ?{" "}
        <Link href="/login" className="font-medium text-[var(--color-primary)]">Connectez-vous</Link>
      </p>
    </div>
  );
}

function Champ({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]" />
    </div>
  );
}

function SelectMembre({ label, valeur, membres, onChange, nomMembre }: {
  label: string; valeur: string; membres: MembreSimple[];
  onChange: (v: string) => void; nomMembre: (m: MembreSimple) => string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">{label}</label>
      <div className="relative">
        <select value={valeur} onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]">
          <option value="">-- Sélectionner --</option>
          {membres.map((m) => (
            <option key={m.id} value={m.id}>{nomMembre(m)}</option>
          ))}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-3 text-[var(--color-text-muted)]" />
      </div>
    </div>
  );
}
