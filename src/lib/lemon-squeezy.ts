import {
  lemonSqueezySetup,
  createCheckout as lsCreateCheckout,
  getSubscription,
  updateSubscription,
  type NewCheckout,
} from "@lemonsqueezy/lemonsqueezy.js";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { checkoutSessions, subscriptions } from "@/db/schema";

lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });

export async function createCheckoutSession(userId: string, variantId: string) {
  const storeId = Number(process.env.LEMONSQUEEZY_STORE_ID!);
  const checkout: NewCheckout = {
    productOptions: {
      name: "Scizen - Gestion SCI familiale",
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    },
    checkoutData: {
      custom: { user_id: userId },
    },
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  };

  const res = await lsCreateCheckout(storeId, Number(variantId), checkout);
  if (res.error || !res.data) {
    throw new Error(res.error?.message ?? "Erreur checkout LemonSqueezy");
  }

  await db.insert(checkoutSessions).values({
    userId,
    lemonSqueezyId: String(res.data.id),
    status: "pending",
    url: res.data.attributes.url,
    price: "19",
  });

  return res.data;
}

export async function handleWebhook(payload: Record<string, unknown>) {
  const meta = payload.meta as Record<string, unknown> | undefined;
  const data = payload.data as Record<string, unknown> | undefined;
  const eventName = meta?.event_name as string | undefined;
  const attr = (data?.attributes ?? {}) as Record<string, unknown>;
  const customData = (meta?.custom_data ?? {}) as Record<string, string>;
  const userId = customData.user_id;

  if (!userId) return;

  if (eventName === "subscription_created" || eventName === "subscription_updated") {
    await db
      .insert(subscriptions)
      .values({
        userId,
        lemonSqueezyId: String(data?.id),
        status: String(attr.status ?? "active"),
        productName: attr.product_name ? String(attr.product_name) : null,
        variantName: attr.variant_name ? String(attr.variant_name) : null,
        renewsAt: attr.renews_at ? new Date(String(attr.renews_at)) : null,
        endsAt: attr.ends_at ? new Date(String(attr.ends_at)) : null,
      })
      .onConflictDoUpdate({
        target: subscriptions.lemonSqueezyId,
        set: {
          status: String(attr.status ?? "active"),
          renewsAt: attr.renews_at ? new Date(String(attr.renews_at)) : null,
          endsAt: attr.ends_at ? new Date(String(attr.ends_at)) : null,
        },
      });
  }

  if (eventName === "subscription_cancelled") {
    await db
      .update(subscriptions)
      .set({
        status: "cancelled",
        endsAt: attr.ends_at ? new Date(String(attr.ends_at)) : null,
      })
      .where(eq(subscriptions.lemonSqueezyId, String(data?.id)));
  }
}
