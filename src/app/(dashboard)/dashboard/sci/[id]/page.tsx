import Link from "next/link";
import { notFound } from "next/navigation";
import { getAgsBySci } from "@/app/actions/ag";
import { getSciById, getSciWithRelations } from "@/app/actions/sci";

export default async function SciDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sci = await getSciById(id);
  if (!sci) return notFound();
  const data = await getSciWithRelations(id);
  if (!data) return notFound();

  const ags = await getAgsBySci(id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
            ← Tableau de bord
          </Link>
          <h1 className="text-2xl font-bold mt-1">{sci.name}</h1>
          <p className="text-sm text-zinc-600">{sci.address}</p>
        </div>
        <Link
          href={`/dashboard/sci/${id}/ag/new`}
          className="rounded bg-foreground px-4 py-2 text-background text-sm font-medium hover:opacity-90"
        >
          Nouvelle AG
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-sm text-zinc-500">Capital social</div>
          <div className="text-lg font-semibold">
            {sci.capitalSocial ? `${Number(sci.capitalSocial).toLocaleString("fr-FR")} €` : "—"}
          </div>
        </div>
        <div className="rounded border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-sm text-zinc-500">Parts totales</div>
          <div className="text-lg font-semibold">{sci.totalParts}</div>
        </div>
        <div className="rounded border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-sm text-zinc-500">Associés</div>
          <div className="text-lg font-semibold">{data.shareholders.length}</div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Assemblées générales</h2>
        {ags.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Aucune AG.{" "}
            <Link href={`/dashboard/sci/${id}/ag/new`} className="underline">
              Créer la première
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {ags.map((ag) => (
              <div
                key={ag.id}
                className="rounded border border-zinc-200 dark:border-zinc-800 p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{ag.title}</div>
                  <div className="text-sm text-zinc-500">
                    {new Date(ag.date).toLocaleDateString("fr-FR")} — {ag.status}
                  </div>
                </div>
                {ag.ordreDuJour && (
                  <div className="text-xs text-zinc-400 max-w-xs truncate">{ag.ordreDuJour}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Transactions récentes</h2>
        {data.transactions.length === 0 ? (
          <p className="text-sm text-zinc-500">Aucune transaction.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.transactions.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="rounded border border-zinc-200 dark:border-zinc-800 p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{t.label}</div>
                  <div className="text-sm text-zinc-500">
                    {new Date(t.date).toLocaleDateString("fr-FR")} — {t.type}
                  </div>
                </div>
                <div
                  className={`font-semibold ${Number(t.amount) >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {Number(t.amount).toLocaleString("fr-FR")} €
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
