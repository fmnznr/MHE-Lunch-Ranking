"use client";

import { useState } from "react";
import { adminLogin } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await adminLogin(password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12">
      <h1 className="font-serif text-3xl mb-8">Admin</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort"
          className="w-full px-4 py-3 rounded-xl border border-charcoal/10 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/50 text-center"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-charcoal text-white font-medium hover:bg-charcoal-light transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Einloggen"}
        </button>
      </form>
    </div>
  );
}
