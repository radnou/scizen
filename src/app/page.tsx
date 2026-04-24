import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight">Scizen</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium px-3 py-2 rounded bg-foreground text-background hover:opacity-90"
          >
            Essayer gratuitement
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold max-w-2xl leading-tight">
          Gérez votre SCI familiale sans en avoir l'air
        </h1>
        <p className="mt-4 text-lg text-zinc-600 max-w-xl">
          Assemblées générales, parts sociales, trésorerie — tout en un seul endroit. Pour que la
          gestion de votre SCI ne soit plus une corvée familiale.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/register"
            className="rounded bg-foreground px-6 py-3 text-background font-semibold hover:opacity-90"
          >
            Commencer l'essai gratuit →
          </Link>
          <Link
            href="/pricing"
            className="rounded border border-zinc-300 dark:border-zinc-700 px-6 py-3 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Voir les tarifs
          </Link>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3 text-left max-w-3xl w-full">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-2">
            <div className="font-semibold">AGs automatisées</div>
            <p className="text-sm text-zinc-500">
              Rédigez et archivez les PV d'assemblée générale en quelques clics.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-2">
            <div className="font-semibold">Parts sociales</div>
            <p className="text-sm text-zinc-500">
              Suivi en temps réel de la répartition des parts entre associés.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-2">
            <div className="font-semibold">Trésorerie</div>
            <p className="text-sm text-zinc-500">
              Transactions, charges et revenus — tout centralise au même endroit.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 p-6 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Scizen. Tous droits réservés.
      </footer>
    </div>
  );
}
