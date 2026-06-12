import Link from "next/link";
import { TreePine, Users, LayoutDashboard, LogIn, Search } from "lucide-react";

export default function EnTete() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-cream)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
            <TreePine size={20} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-[var(--color-text)]">
            Famille <span className="text-[var(--color-primary)]">Maykas</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <NavLink href="/arbre" icon={<TreePine size={16} />} label="Arbre généalogique" />
          <NavLink href="/membres" icon={<Users size={16} />} label="Membres" />
          <NavLink href="/recherche" icon={<Search size={16} />} label="Recherche" />
          <NavLink href="/admin" icon={<LayoutDashboard size={16} />} label="Administration" />
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            <LogIn size={15} />
            Connexion
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary-dark)]"
          >
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-gold-light)]/40 hover:text-[var(--color-primary)]"
    >
      {icon}
      {label}
    </Link>
  );
}
