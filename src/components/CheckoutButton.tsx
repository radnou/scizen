"use client";

import { useState } from "react";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string };
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      alert("Erreur checkout");
    } catch {
      alert("Erreur checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="rounded bg-foreground px-6 py-3 text-background font-semibold disabled:opacity-50 w-full"
    >
      {loading ? "Redirection..." : "Commencer l'essai gratuit"}
    </button>
  );
}
