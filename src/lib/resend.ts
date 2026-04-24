import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { db } from "@/db";
import { leads, outreachLogs } from "@/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendOutreach(params: {
  to: string;
  campaignId: string;
  leadId: string;
  subject: string;
  template: string;
}) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: params.to,
    subject: params.subject,
    html: params.template,
  });

  if (error) {
    await db.insert(outreachLogs).values({
      campaignId: params.campaignId,
      leadId: params.leadId,
      status: "failed",
      error: error.message,
    });
    throw error;
  }

  await db.insert(outreachLogs).values({
    campaignId: params.campaignId,
    leadId: params.leadId,
    status: "sent",
    sentAt: new Date(),
  });

  await db.update(leads).set({ contacted: true }).where(eq(leads.id, params.leadId));

  return data;
}
