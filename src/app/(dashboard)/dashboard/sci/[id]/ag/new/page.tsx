import Link from "next/link";
import { AgForm } from "@/components/ag/AgForm";

export default async function NewAgPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="max-w-xl">
      <Link href={`/dashboard/sci/${id}`} className="text-sm text-zinc-500 hover:underline">← Retour à la SCI</Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Nouvelle assemblée générale</h1>
      <AgForm sciId={id} />
    </div>
  );
}
