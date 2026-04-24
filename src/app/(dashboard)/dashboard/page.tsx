import Link from "next/link";
import { Suspense } from "react";
import { getMyScis, getSciStats } from "@/app/actions/sci";

type SciItem = Awaited<ReturnType<typeof getMyScis>>[number];

async function SciCard({ sci }: { sci: SciItem }) {
  const stats = await getSciStats(sci.id);
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{sci.name}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{sci.address}</p>
        </div>
        <Link
          href={`/dashboard/sci/${sci.id}`}
          className="text-sm font-medium px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          Voir
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded bg-zinc-50 dark:bg-zinc-900 p-3">
          <div className="text-zinc-500">Associés</div>
          <div className="font-semibold">{stats.shareholdersCount}</div>
        </div>
        <div className="rounded bg-zinc-50 dark:bg-zinc-900 p-3">
          <div className="text-zinc-500">Prochaine AG</div>
          <div className="font-semibold truncate">
            {stats.nextAg ? new Date(stats.nextAg.date).toLocaleDateString("fr-FR") : "Aucune"}
          </div>
        </div>
      </div>
      {sci.capitalSocial && (
        <div className="text-sm text-zinc-600">
          Capital social: {Number(sci.capitalSocial).toLocaleString("fr-FR")} €
        </div>
      )}
    </div>
  );
}

async function SciList() {
  const scis = await getMyScis();
  if (!scis.length) {
    return (
      <div className="text-zinc-500">
        Aucune SCI pour le moment.{" "}
        <Link href="/dashboard/sci/new" className="underline">
          Créer une SCI
        </Link>
        .
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {scis.map((s) => (
        <SciCard key={s.id} sci={s} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes SCI</h1>
        <Link
          href="/dashboard/sci/new"
          className="rounded bg-foreground px-4 py-2 text-background text-sm font-medium hover:opacity-90"
        >
          Créer une SCI
        </Link>
      </div>
      <Suspense fallback={<div className="text-sm text-zinc-500">Chargement...</div>}>
        <SciList />
      </Suspense>
    </div>
  );
}
