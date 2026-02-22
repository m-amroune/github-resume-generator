"use client";

import SearchForm from "@/components/SearchForm";
import { useState } from "react";
import Image from "next/image";

//  user data used in the UI
type GitHubUser = {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
};

// repo data used in the UI
type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  fork: boolean;
  language: string | null;
  updated_at: string;
};

export default function Home() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);

  // Primary selection: non-fork repos with description and stars
  const primaryRepos = repos
    .filter(
      (repo) => !repo.fork && repo.description && repo.stargazers_count > 0,
    )
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  // Fallback selection: non-fork repos with description, sorted by last update

  const fallbackRepos = repos
    .filter((repo) => !repo.fork && repo.description)
    .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
    .slice(0, 6);

  // Use fallback when no starred repos match
  const topRepos = primaryRepos.length > 0 ? primaryRepos : fallbackRepos;

  // Compute top languages from repositories
  const topLanguages = Object.entries(
    repos.reduce((acc: Record<string, number>, repo) => {
      if (repo.language) {
        acc[repo.language] = (acc[repo.language] || 0) + 1;
      }
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Fetch user and repositories from GitHub API
  async function handleGenerate(username: string) {
    setError(null);
    setUser(null);

    // Fetch user
    const res = await fetch(`https://api.github.com/users/${username}`);

    if (!res.ok) {
      setError("User not found");
      return;
    }

    const data = await res.json();

    // Map only required fields
    setUser({
      login: data.login,
      avatar_url: data.avatar_url,
      html_url: data.html_url,
      name: data.name,
      bio: data.bio,
      location: data.location,
      company: data.company,
    });

    // Fetch repositories (max 100)
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    );

    const reposData = await reposRes.json();

    // Map only required repo fields
    setRepos(
      reposData.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count,
        fork: repo.fork,
        language: repo.language,
        updated_at: repo.updated_at,
      })),
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-semibold">GitHub Resume Generator</h1>

      <SearchForm onSubmit={handleGenerate} />

      {/* Error message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* User header */}
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
      {/* About section */}
      {user && (
        <div className="w-full max-w-xl border rounded p-4">
          {user.name && <h2 className="font-semibold text-lg">{user.name}</h2>}

          {user.bio && <p className="text-sm mt-2">{user.bio}</p>}

          <div className="text-sm text-gray-500 mt-2 space-y-1">
            {user.location && <p>Location: {user.location}</p>}
            {user.company && <p>Company: {user.company}</p>}
          </div>
        </div>
      )}
      {/* Top languages */}
      {topLanguages.length > 0 && (
        <div className="w-full max-w-xl">
          <h2 className="font-semibold mb-2">Skills</h2>
          <ul className="flex flex-wrap gap-2">
            {topLanguages.map(([language, count]) => (
              <li key={language} className="border px-2 py-1 text-sm rounded">
                {language} ({count})
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* {/* Top repositories */}
      {repos.length > 0 && <p>{repos.length} repos found</p>}
      {/* Top repository by stars  */}
      {topRepos.length > 0 && (
        <div className="w-full max-w-xl space-y-3">
          {topRepos.map((repo) => (
            <div key={repo.id} className="border rounded p-3">
              <div className="flex items-center justify-between gap-4">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-medium"
                >
                  {repo.name}
                </a>
                <span className="text-sm text-gray-500">
                  ⭐ {repo.stargazers_count}
                </span>
              </div>

              {repo.description && (
                <p className="text-sm text-gray-600 mt-2">{repo.description}</p>
              )}
              {repo.language && (
                <p className="text-xs text-gray-500 mt-1">{repo.language}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
