"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gold">TOP TEN COMMAND CENTER</h1>
          <p className="text-sm text-gray-400">Inicia sesión para continuar</p>
        </div>

        <div>
          <label className="text-xs text-gray-400">Correo</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 bg-panel border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-gold"
            placeholder="tucorreo@ejemplo.com"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 bg-panel border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-gold"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-xs text-hot">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold text-ink font-semibold rounded-lg py-2 text-sm disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
