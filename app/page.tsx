"use client";

import SearchForm from "@/components/SearchForm";
import { useState } from "react";
import Image from "next/image";

type GitHubUser = {
  login: string;
  avatar_url: string;
  html_url: string;
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
    setUser({
      login: data.login,
      avatar_url: data.avatar_url,
      html_url: data.html_url,
    });
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-semibold">GitHub Resume Generator</h1>

      <SearchForm onSubmit={handleGenerate} />

      {error && <p className="text-red-500">{error}</p>}
      {user && (
        <div className="flex items-center gap-4">
          <Image
            src={user.avatar_url}
            alt={`${user.login} avatar`}
            width={64}
            height={64}
            className="rounded-full border"
          />
          <div className="flex flex-col">
            <p className="font-semibold">{user.login}</p>
            <a
              href={user.html_url}
              target="_blank"
              rel="noreferrer"
              className="underline text-sm"
            >
              View GitHub profile
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
