"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { ags } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

const createAgSchema = z.object({
  title: z.string().min(2, "Titre trop court"),
  date: z.string().min(1, "Date requise"),
  ordreDuJour: z.string().optional(),
});

export async function createAg(sciId: string, formData: FormData): Promise<void | { error: string; issues?: unknown }> {
  await requireAuth();
  const raw = Object.fromEntries(formData.entries());
  const parsed = createAgSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Données invalides", issues: parsed.error.issues };
  }

  const { title, date, ordreDuJour } = parsed.data;
  await db.insert(ags).values({
    sciId,
    title,
    date: new Date(date),
    ordreDuJour: ordreDuJour || null,
    status: "planned",
  });

  revalidatePath(`/dashboard/sci/${sciId}`);
  redirect(`/dashboard/sci/${sciId}`);
}

export async function getAgsBySci(sciId: string) {
  const rows = await db.select().from(ags).where(eq(ags.sciId, sciId)).orderBy(desc(ags.date));
  return rows;
}
