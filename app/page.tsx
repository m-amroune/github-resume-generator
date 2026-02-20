"use client";

import SearchForm from "@/components/SearchForm";
import { useState } from "react";

type GitHubUser = {
  login: string;
};

export default function Home() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(username: string) {
    setError(null);
    setUser(null);

    const res = await fetch(`https://api.github.com/users/${username}`);

    if (!res.ok) {
      setError("User not found");
      return;
    }

    const data = await res.json();
    setUser({ login: data.login });
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-semibold">GitHub Resume Generator</h1>

      <SearchForm onSubmit={handleGenerate} />

      {error && <p className="text-red-500">{error}</p>}
      {user && <p className="text-green-600">{user.login}</p>}
    </main>
  );
}
