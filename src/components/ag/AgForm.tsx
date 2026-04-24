"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAg } from "@/app/actions/ag";

export function AgForm({ sciId }: { sciId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await createAg(sciId, fd);
    setPending(false);
    if (res && typeof res === "object" && "error" in res) {
      setError(String(res.error));
    } else {
      router.push(`/dashboard/sci/${sciId}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error && <div className="rounded bg-red-100 text-red-700 px-3 py-2 text-sm">{error}</div>}
      <label className="flex flex-col gap-1 text-sm">
        Titre
        <input name="title" required minLength={2} className="rounded border border-zinc-300 px-3 py-2 dark:bg-zinc-900 dark:border-zinc-700" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Date
        <input name="date" type="date" required className="rounded border border-zinc-300 px-3 py-2 dark:bg-zinc-900 dark:border-zinc-700" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Ordre du jour
        <textarea name="ordreDuJour" rows={4} placeholder="1. Approbation des comptes..." className="rounded border border-zinc-300 px-3 py-2 dark:bg-zinc-900 dark:border-zinc-700" />
      </label>
      <div className="flex gap-3 items-center mt-2">
        <button type="submit" disabled={pending} className="rounded bg-foreground px-4 py-2 text-background font-medium hover:opacity-90 disabled:opacity-50">
          {pending ? "Création..." : "Créer l'AG"}
        </button>
      </div>
    </form>
  );
}
