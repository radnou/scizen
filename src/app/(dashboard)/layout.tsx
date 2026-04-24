import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-6">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          Scizen
        </Link>
        <nav className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="text-sm font-medium px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Tableau de bord
          </Link>
        </nav>
        <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{user.name}</div>
          <div className="text-xs text-zinc-500">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
