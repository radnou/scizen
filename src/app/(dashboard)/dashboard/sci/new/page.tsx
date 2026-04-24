import Link from "next/link";
import { createSci } from "@/app/actions/sci";

export default function NewSciPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Créer une SCI</h1>
      <form action={createSci} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Nom de la SCI
          <input
            name="name"
            required
            minLength={2}
            className="rounded border border-zinc-300 px-3 py-2 dark:bg-zinc-900 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Adresse complète
          <textarea
            name="address"
            required
            minLength={5}
            rows={3}
            className="rounded border border-zinc-300 px-3 py-2 dark:bg-zinc-900 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Capital social (€)
          <input
            name="capitalSocial"
            type="number"
            min={0}
            className="rounded border border-zinc-300 px-3 py-2 dark:bg-zinc-900 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Nombre total de parts
          <input
            name="totalParts"
            type="number"
            required
            min={1}
            defaultValue={1}
            className="rounded border border-zinc-300 px-3 py-2 dark:bg-zinc-900 dark:border-zinc-700"
          />
        </label>
        <div className="flex gap-3 items-center mt-2">
          <button
            type="submit"
            className="rounded bg-foreground px-4 py-2 text-background font-medium hover:opacity-90"
          >
            Créer
          </button>
          <Link href="/dashboard" className="text-sm text-zinc-600 hover:underline">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
