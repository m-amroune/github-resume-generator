"use client";

import SearchForm from "@/components/SearchForm";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchResume } from "@/lib/fetchResume";
import Image from "next/image";
import { getDaysAgo } from "@/utils/getDaysAgo";
import { selectTopRepos, type GitHubRepo } from "@/utils/selectTopRepos";
import { getTopLanguages } from "@/utils/getTopLanguages";



export default function Home() {
const [username, setUsername] = useState("");
const [repoLimit, setRepoLimit] = useState(6);

const {
  data,
  error: queryError,
  isFetching,
} = useQuery({
  queryKey: ["resume", username],
  queryFn: () => fetchResume(username),
  enabled: username !== "",
  retry: false,
});

const user = data?.user ?? null;
const repos = data?.repos ?? [];
const error = queryError?.message ?? null;
const loading = isFetching;

  // Select repositories to display
  const topRepos = selectTopRepos(repos, repoLimit);

  // Compute top languages from repositories
  const topLanguages = getTopLanguages(repos);

// Start the GitHub data query
const handleGenerate = (username: string) => {
  setUsername(username);
};


  return (
    <main className="min-h-screen bg-[#f3f1ec] px-4 py-10 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl space-y-8 print:w-full print:max-w-none print:space-y-0">
        <section className="rounded-2xl bg-[#24324a] px-6 py-16 text-center text-white shadow-lg sm:px-10 sm:py-20 print:hidden">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            GitHub Resume Generator
          </h1>

          <p className="mt-3 text-base text-slate-300">
            Generate a resume from a GitHub profile.
          </p>

          <div className="mt-6">
            <SearchForm onSubmit={handleGenerate} disabled={loading} />
          </div>
          {user && (
  <div className="mt-5 flex items-center justify-center gap-3">
    <label htmlFor="repo-limit" className="text-sm text-slate-300">
      Repositories to display:
    </label>

    <select
      id="repo-limit"
      value={repoLimit}
      onChange={(event) => setRepoLimit(Number(event.target.value))}
      className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-medium text-[#24324a]"
    >
      <option value={6}>6</option>
      <option value={10}>10</option>
      <option value={15}>15</option>
      <option value={20}>20</option>
    </select>
  </div>
)}
          {loading && <p className="mt-4 text-slate-300">Loading...</p>}

          {error && <p className="mt-4 text-red-300">{error}</p>}
        </section>

        {user && (
          <div className="flex justify-end print:hidden">
            <button
              onClick={() => window.print()}
              className="rounded-lg border-2 border-[#24324a] bg-white px-5 py-3 font-medium text-[#24324a] transition hover:bg-[#24324a] hover:text-white"
            >
              Download PDF
            </button>
          </div>
        )}

        {user && (
          <div className="rounded-2xl bg-white p-5 text-center shadow-lg sm:p-10 print:rounded-none print:p-0 print:shadow-none">
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

            <div className="my-8 h-px bg-[#d9dde5]"></div>

            {/* About section */}
            {(user.bio || user.location || user.company) && (
              <section className="w-full border-l-4 border-[#24324a] pl-5 text-left">
                <h2 className="mb-4 inline-block border-b-2 border-[#f4c95d] pb-1 text-xl font-semibold text-[#24324a]">
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
            )}

            <div className="my-8 h-px bg-[#d9dde5]"></div>

            {/* Skills */}
            {topLanguages.length > 0 && (
              <section className="w-full text-left">
                <h2 className="mb-4 inline-block border-b-2 border-[#f4c95d] pb-1 text-xl font-semibold text-[#24324a]">
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

            <div className="my-8 h-px bg-[#d9dde5]"></div>

            {/* Top repositories */}
            {topRepos.length === 0 && (
              <p className="text-left text-gray-600">
                No repositories to display.
              </p>
            )}
            {topRepos.length > 0 && (
              <section className="w-full text-left">
                <h2 className="mb-4 inline-block border-b-2 border-[#f4c95d] pb-1 text-xl font-semibold text-[#24324a]">
                  Top Repositories
                </h2>

                <div className="divide-y divide-gray-200">
                  {user && topRepos.length === 0 && (
                    <p className="text-left text-gray-600">
                      No repositories to display.
                    </p>
                  )}
                  {topRepos.map((repo) => (
                    <article
                      key={repo.id}
                      className="w-full py-4 print:break-inside-avoid"
                    >
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
                          <span className="rounded-md border border-[#cbd3df] bg-[#eef1f6] px-2.5 py-1 font-medium text-[#40577d]">
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
