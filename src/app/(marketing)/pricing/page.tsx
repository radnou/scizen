import Link from "next/link";
import { CheckoutButton } from "@/components/CheckoutButton";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl font-extrabold">Scizen</h1>
        <p className="text-lg text-zinc-600">La gestion de votre SCI familiale, enfin simple.</p>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-4">
          <div className="text-5xl font-bold">
            19€<span className="text-xl font-normal text-zinc-500">/mois</span>
          </div>
          <ul className="space-y-2 text-left inline-block text-zinc-700">
            <li>✅ Gestion illimitée des SCI</li>
            <li>✅ Assemblées générales + PV auto</li>
            <li>✅ Suivi des parts sociales</li>
            <li>✅ Transactions & trésorerie</li>
            <li>✅ Support email</li>
          </ul>
          <CheckoutButton />
        </div>

        <p className="text-sm text-zinc-500">
          30 jours gratuit. Sans engagement.{" "}
          <Link href="/login" className="underline">
            Déjà inscrit ?
          </Link>
        </p>
      </div>
    </div>
  );
}
