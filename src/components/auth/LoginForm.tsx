"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
      }),
      headers: { "content-type": "application/json" },
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Erreur");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <h1 className="text-2xl font-bold">Connexion</h1>
      {error && (
        <div className="rounded bg-red-100 text-red-700 px-3 py-2 text-sm">{error}</div>
      )}
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          className="rounded border border-zinc-300 px-3 py-2 dark:bg-zinc-900 dark:border-zinc-700"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Mot de passe
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="rounded border border-zinc-300 px-3 py-2 dark:bg-zinc-900 dark:border-zinc-700"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-foreground px-4 py-2 text-background font-medium disabled:opacity-50"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
      <p className="text-sm text-zinc-600">
        Pas encore de compte ?{" "}
        <a href="/register" className="underline">Créer un compte</a>
      </p>
    </form>
  );
}
