"use client";

import type { NoeudArbre } from "@/types";
import CarteMembre from "@/components/profile/CarteMembre";

export default function NoeudArbreComponent({ noeud }: { noeud: NoeudArbre }) {
  const aDesEnfants = noeud.enfants.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Couple : membre principal + conjoint(s) */}
      <div className="flex items-center gap-3">
        <CarteMembre membre={noeud} />
        {noeud.conjoints.map((conjoint) => (
          <div key={conjoint.id} className="flex items-center gap-3">
            <div className="h-0.5 w-6 bg-[var(--color-forest-light)]" style={{ borderTop: "2px dashed var(--color-forest-light)", background: "transparent" }} />
            <CarteMembre membre={conjoint} estConjoint />
          </div>
        ))}
      </div>

      {/* Connecteur vers les enfants */}
      {aDesEnfants && (
        <>
          <div className="h-6 w-0.5 bg-[var(--color-gold)]" />
          <div className="relative flex items-start gap-8 pt-0">
            {/* Ligne horizontale reliant les enfants */}
            {noeud.enfants.length > 1 && (
              <div
                className="absolute top-0 h-0.5 bg-[var(--color-gold)]"
                style={{
                  left: "calc(50% / var(--n) )",
                }}
              />
            )}
            {noeud.enfants.map((enfant) => (
              <div key={enfant.id} className="flex flex-col items-center">
                <div className="h-6 w-0.5 bg-[var(--color-gold)]" />
                <NoeudArbreComponent noeud={enfant} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
