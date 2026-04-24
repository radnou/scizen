"use server";

import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { ags, scis, shareholders, transactions } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

const createSciSchema = z.object({
  name: z.string().min(2, "Nom trop court"),
  address: z.string().min(5, "Adresse invalide"),
  capitalSocial: z.string().optional(),
  totalParts: z.string().min(1, "Requis"),
});

export async function createSci(formData: FormData) {
  const session = await requireAuth();
  if (!session.userId) throw new Error("Unauthorized");
  const raw = Object.fromEntries(formData.entries());
  const parsed = createSciSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Données invalides", issues: parsed.error.issues };
  }

  const { name, address, capitalSocial, totalParts } = parsed.data;
  const capital = capitalSocial ? Number(capitalSocial) : null;
  const parts = Number(totalParts) || 1;

  const [sci] = await db
    .insert(scis)
    .values({
      name,
      address,
      capitalSocial: capital ? String(capital) : null,
      totalParts: parts,
      adminId: session.userId,
    })
    .returning();

  await db.insert(shareholders).values({
    sciId: sci.id,
    userId: session.userId,
    partsOwned: parts,
    role: "admin",
    status: "active",
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function getMyScis() {
  const session = await requireAuth();
  if (!session.userId) throw new Error("Unauthorized");
  return db
    .select()
    .from(scis)
    .where(eq(scis.adminId, session.userId))
    .orderBy(desc(scis.createdAt));
}

export async function getSciById(id: string) {
  const session = await requireAuth();
  if (!session.userId) throw new Error("Unauthorized");
  const rows = await db.select().from(scis).where(eq(scis.id, id)).limit(1);
  const sci = rows[0];
  if (!sci) return null;
  if (sci.adminId !== session.userId) {
    const sh = await db
      .select()
      .from(shareholders)
      .where(eq(shareholders.sciId, id))
      .where(eq(shareholders.userId, session.userId))
      .limit(1);
    if (!sh.length) return null;
  }
  return sci;
}

export async function getSciStats(id: string) {
  await requireAuth();
  const shCount = await db
    .select({ value: sql<count>`count(*)` })
    .from(shareholders)
    .where(eq(shareholders.sciId, id));
  const nextAgRows = await db
    .select()
    .from(ags)
    .where(eq(ags.sciId, id))
    .orderBy(ags.date)
    .limit(1);
  return {
    shareholdersCount: Number(shCount[0]?.value ?? 0),
    nextAg: nextAgRows[0] || null,
  };
}

export async function getSciWithRelations(id: string) {
  const [sci] = await db.select().from(scis).where(eq(scis.id, id)).limit(1);
  if (!sci) return null;

  const shareholdersList = await db.select().from(shareholders).where(eq(shareholders.sciId, id));
  const agsList = await db.select().from(ags).where(eq(ags.sciId, id)).orderBy(desc(ags.date));
  const transactionsList = await db
    .select()
    .from(transactions)
    .where(eq(transactions.sciId, id))
    .orderBy(desc(transactions.date));

  return { sci, shareholders: shareholdersList, ags: agsList, transactions: transactionsList };
}
