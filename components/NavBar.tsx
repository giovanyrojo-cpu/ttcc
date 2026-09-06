"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

const items = [
  { href: "/", label: "Inicio" },
  { href: "/leads", label: "Leads" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/commissions", label: "Comisiones" },
  { href: "/properties", label: "Propiedades" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-panel border-t border-line md:static md:border-none md:bg-transparent">
      <div className="max-w-5xl mx-auto flex justify-around md:justify-start md:gap-6 md:px-4 py-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs md:text-sm px-2 py-1 rounded ${
                active ? "text-gold font-semibold" : "text-gray-400"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="text-xs md:text-sm px-2 py-1 text-gray-500"
        >
          Salir
        </button>
      </div>
    </nav>
  );
}
