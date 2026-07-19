"use client";

import SearchForm from "@/components/SearchForm";
import { useState } from "react";
import Image from "next/image";

// User data used in the UI
type GitHubUser = {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
};

// Repository data used in the UI
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

type ResumeResponse = {
  user: GitHubUser;
  repos: GitHubRepo[];
};

// Calculates how many days passed since the repo was updated
const getDaysAgo = (dateString: string): string => {
  const updated = new Date(dateString).getTime();
  const now = Date.now();
  const diff = Math.floor((now - updated) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Updated today";
  if (diff === 1) return "Updated 1 day ago";

  return `Updated ${diff} days ago`;
};

export default function Home() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);

  // Primary selection: non-fork, with description and stars
  const primaryRepos = repos
    .filter(
      (repo) => !repo.fork && repo.description && repo.stargazers_count > 0,
    )
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  // Fallback selection: non-fork with description, sorted by update date
  const fallbackRepos = repos
    .filter((repo) => !repo.fork && repo.description)
    .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
    .slice(0, 6);

  // Use fallback if no starred repos match
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
  const handleGenerate = async (username: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/resume/${username}`);

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Error");
        setLoading(false);
        return;
      }

      const data: ResumeResponse = await res.json();

      setUser(data.user);
      setRepos(data.repos);
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f1ec] px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-2xl bg-[#24324a] px-6 py-16 text-center text-white shadow-lg sm:px-10 sm:py-20">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            GitHub Resume Generator
          </h1>

          <p className="mt-3 text-base text-slate-300">
            Generate a resume from a GitHub profile.
          </p>

          <div className="mt-6">
            <SearchForm onSubmit={handleGenerate} disabled={loading} />
          </div>

          {loading && <p className="mt-4 text-slate-300">Loading...</p>}

          {error && <p className="mt-4 text-red-300">{error}</p>}
        </section>

        {user && (
          <div className="flex justify-end">
            <button
              onClick={() => window.print()}
              className="rounded-lg border-2 border-[#24324a] bg-white px-5 py-3 font-medium text-[#24324a] transition hover:bg-[#24324a] hover:text-white"
            >
              Download PDF
            </button>
          </div>
        )}

        {user && (
          <div className="rounded-2xl bg-white p-5 text-center shadow-lg sm:p-10">
            {/* User header */}
            <div className="flex flex-col items-center gap-4 border-l-4 border-[#24324a] bg-[#f7f8fa] p-6 text-center sm:flex-row sm:gap-6 sm:text-left">
              <Image
                src={user.avatar_url}
                alt={`${user.login} avatar`}
                width={80}
                height={80}
                className="rounded-full border"
              />

            <div className="flex flex-col space-y-1 text-center sm:text-left">
                <p className="text-2xl font-semibold">{user.login}</p>

                {user.name && (
                  <p className="text-sm text-gray-700">{user.name}</p>
                )}

                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-[#40577d] hover:underline"
                >
                  View GitHub profile
                </a>
              </div>
            </div>

            <div className="my-10 h-px bg-[#d9dde5]"></div>

            {/* About section */}
            <section className="w-full border-l-4 border-[#24324a] pl-5 text-left">
              <h2 className="mb-4 text-xl font-semibold text-[#24324a]">
                About
              </h2>

              {user.bio && (
                <p className="leading-relaxed text-gray-700">{user.bio}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                {user.location && <p>Location: {user.location}</p>}
                {user.company && <p>Company: {user.company}</p>}
              </div>
            </section>

            <div className="my-10 h-px bg-[#d9dde5]"></div>

            {/* Skills */}
            {topLanguages.length > 0 && (
              <section className="w-full text-left">
                <h2 className="mb-4 text-xl font-semibold text-[#24324a]">
                  Skills
                </h2>

                <ul className="flex flex-wrap gap-3">
                  {topLanguages.map(([language, count]) => (
                    <li
                      key={language}
                      className="rounded-full border border-[#f4c95d] bg-[#fff8e1] px-4 py-2 text-base font-medium text-[#24324a]"
                    >
                      {language} ({count})
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="my-10 h-px bg-[#d9dde5]"></div>

            {/* Top repositories */}
            {/* Top repositories */}
{topRepos.length > 0 && (
  <section className="w-full text-left">
    <h2 className="mb-2 text-xl font-semibold text-[#24324a]">
      Top Repositories
    </h2>

    <div className="divide-y divide-gray-200">
      {topRepos.map((repo) => (
        <article key={repo.id} className="w-full py-5">
          <div className="flex flex-col items-start gap-3 md:flex-row md:justify-between md:gap-4">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 wrap-break-word  text-lg font-semibold text-[#40577d] hover:underline"
            >
              {repo.name}
            </a>

            <span className="shrink-0 rounded-full bg-[#fff8e1] px-3 py-1 text-sm font-medium text-[#24324a]">
              ⭐ {repo.stargazers_count}
            </span>
          </div>

          {repo.description && (
            <p className="mt-3 leading-relaxed text-gray-700">
              {repo.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-3 text-sm text-gray-600">
            {repo.language && (
              <span className="rounded-md bg-[#eef1f6] px-2.5 py-1 font-medium text-[#40577d]">
                {repo.language}
              </span>
            )}

            <span>{getDaysAgo(repo.updated_at)}</span>
          </div>
        </article>
      ))}
    </div>
  </section>
)}
          </div>
        )}
      </div>
    </main>
  );
}