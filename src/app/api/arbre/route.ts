import { NextResponse } from "next/server";
import { construireArbreGenealogique } from "@/lib/arbre";

export async function GET() {
  try {
    const arbre = await construireArbreGenealogique();
    return NextResponse.json({ success: true, data: arbre });
  } catch (error) {
    console.error("Erreur construction arbre :", error);
    return NextResponse.json(
      { success: false, error: "Impossible de charger l'arbre généalogique." },
      { status: 500 }
    );
  }
}
