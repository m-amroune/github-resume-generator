"use client";

import SearchForm from "@/components/SearchForm";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchResume } from "@/lib/fetchResume";
import Image from "next/image";
import { getDaysAgo } from "@/utils/getDaysAgo";
import { selectTopRepos, type GitHubRepo } from "@/utils/selectTopRepos";
import { getTopLanguages } from "@/utils/getTopLanguages";

const TWELVE_MONTHS_AGO = Date.now() - 365 * 24 * 60 * 60 * 1000;

export default function Home() {
  const [username, setUsername] = useState("");
  const [repoLimit, setRepoLimit] = useState(6);
  const [selectedRepoIds, setSelectedRepoIds] = useState<number[] | null>(null);

  const {
    data,
    error: queryError,
    isFetching,
  } = useQuery({
    queryKey: ["resume", username],
    queryFn: () => fetchResume(username),
    enabled: username !== "",
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const user = data?.user ?? null;
  const repos = data?.repos ?? [];
  const error = queryError?.message ?? null;
  const loading = isFetching;

  // Select repositories to display
  const topRepos = selectTopRepos(repos, repoLimit);

  const displayedRepos =
    selectedRepoIds === null
      ? topRepos
      : selectedRepoIds
          .map((id) => repos.find((repo) => repo.id === id))
          .filter((repo): repo is GitHubRepo => repo !== undefined);

  const selectableRepos = repos.filter((repo) => !repo.fork);

  const otherRepos = selectableRepos.filter(
    (repo) =>
      !displayedRepos.some((selectedRepo) => selectedRepo.id === repo.id),
  );

  // Compute top languages from all non-fork repositories
  const topLanguages = getTopLanguages(selectableRepos);

  // Start the GitHub data query

  // Start the GitHub data query
  const handleGenerate = (username: string) => {
    setSelectedRepoIds(null);
    setUsername(username);
  };

  const handleRepoToggle = (repoId: number) => {
    const currentIds = selectedRepoIds ?? topRepos.map((repo) => repo.id);

    if (currentIds.includes(repoId)) {
      setSelectedRepoIds(currentIds.filter((id) => id !== repoId));
      return;
    }

    if (currentIds.length < repoLimit) {
      setSelectedRepoIds([...currentIds, repoId]);
    }
  };

  const handleRepoMove = (index: number, direction: "up" | "down") => {
    const currentIds = selectedRepoIds ?? topRepos.map((repo) => repo.id);

    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= currentIds.length) {
      return;
    }

    const nextIds = [...currentIds];

    [nextIds[index], nextIds[targetIndex]] = [
      nextIds[targetIndex],
      nextIds[index],
    ];

    setSelectedRepoIds(nextIds);
  };

  return (
    <div className="min-h-screen bg-[#f3f1ec]">
      <main
        className={`mx-auto min-h-screen w-full max-w-384 bg-[#f3f1ec] print:max-w-none print:bg-white print:p-0 ${
          user ? "px-4 py-10" : ""
        }`}
      >
        {!user ? (
          <section className="w-full bg-[#24324a] text-white print:hidden">
            <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-10">
              {/* Initial search */}
              <div className="flex flex-col items-center text-center lg:pt-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  GitHub{" "}
                  <span className="text-[#f4c95d]">Resume Generator</span>
                </h1>

                <p className="mt-5 text-base text-slate-300 sm:text-lg">
                  Generate a resume from a GitHub profile.
                </p>

                <div className="mt-8 w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-2 shadow-xl shadow-black/10">
                  <SearchForm onSubmit={handleGenerate} disabled={loading} />
                </div>

                {loading && <p className="mt-5 text-slate-300">Loading...</p>}

                {error && <p className="mt-5 text-red-300">{error}</p>}
              </div>

              {/* Resume preview */}
              <div className="hidden lg:block">
                <div className="pointer-events-none mx-auto w-full max-w-60 select-none rounded-lg border border-[#d9dde5] bg-white p-2 text-left text-[#24324a] opacity-55 shadow-sm">
                  {/* Preview header */}
                  <div className="flex items-center gap-2 border-l-4 border-[#24324a] bg-[#f7f8fa] p-2">
                    <div className="size-8 shrink-0 rounded-full bg-gray-300" />

                    <div className="space-y-1">
                      <div className="h-2 w-20 rounded bg-gray-300" />
                      <div className="h-1.5 w-14 rounded bg-gray-200" />
                      <div className="h-1.5 w-16 rounded bg-gray-200" />
                    </div>
                  </div>

                  <div className="my-2 h-px bg-[#d9dde5]" />

                  {/* Preview: About */}
                  <div className="border-l-4 border-[#24324a] pl-2">
                    <p className="mb-1.5 w-fit border-b border-[#f4c95d] pb-0.5 text-[10px] font-semibold">
                      About
                    </p>

                    <div className="space-y-1">
                      <div className="h-1.5 w-4/5 rounded bg-gray-300" />
                      <div className="h-1.5 w-3/5 rounded bg-gray-200" />
                    </div>
                  </div>

                  <div className="my-2 h-px bg-[#d9dde5]" />

                  {/* Preview: Skills */}
                  <div>
                    <p className="mb-1.5 w-fit border-b border-[#f4c95d] pb-0.5 text-[10px] font-semibold">
                      Skills
                    </p>

                    <div className="flex flex-nowrap gap-1">
                      {["TypeScript", "Python", "Go", "Rust"].map(
                        (language) => (
                          <span
                            key={language}
                            className="whitespace-nowrap rounded-full border border-[#f4c95d] bg-[#fff8e1] px-1 py-0.5 text-[8px] font-medium"
                          >
                            {language}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="my-2 h-px bg-[#d9dde5]" />

                  {/* Preview: Top repositories */}
                  <div>
                    <p className="mb-1.5 w-fit border-b border-[#f4c95d] pb-0.5 text-[10px] font-semibold">
                      Top Repositories
                    </p>

                    <div className="space-y-3">
                      <div className="py-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="h-2 w-16 rounded bg-[#cbd3df]" />

                          <span className="rounded-full bg-[#fff8e1] px-1.5 py-0.5 text-[8px] font-medium">
                            ⭐ 32
                          </span>
                        </div>

                        <div className="mt-1 h-1.5 w-3/4 rounded bg-gray-200" />

                        <div className="mt-1 flex items-center gap-1.5 text-[8px] text-gray-500">
                          <span className="rounded border border-[#cbd3df] bg-[#eef1f6] px-1 py-0.5">
                            TypeScript
                          </span>

                          <span>Updated recently</span>
                        </div>
                      </div>

                      <div className="py-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="h-2 w-20 rounded bg-[#cbd3df]" />

                          <span className="rounded-full bg-[#fff8e1] px-1.5 py-0.5 text-[8px] font-medium">
                            ⭐ 14
                          </span>
                        </div>

                        <div className="mt-1 h-1.5 w-2/3 rounded bg-gray-200" />

                        <div className="mt-1 flex items-center gap-1.5 text-[8px] text-gray-500">
                          <span className="rounded border border-[#cbd3df] bg-[#eef1f6] px-1 py-0.5">
                            Go
                          </span>

                          <span>Updated recently</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="mx-auto max-w-4xl space-y-8 print:w-full print:max-w-none print:space-y-0">
            {/* Search and repository controls */}
            <section className="rounded-2xl bg-[#24324a] px-6 py-8 text-center text-white shadow-lg sm:px-10 print:hidden">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                GitHub <span className="text-[#f4c95d]">Resume Generator</span>
              </h1>

              <p className="mt-3 text-base text-slate-300">
                Generate a resume from a GitHub profile.
              </p>

              <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-2 shadow-xl shadow-black/10">
                <SearchForm onSubmit={handleGenerate} disabled={loading} />
              </div>

              {/* Repository controls */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="repo-limit"
                    className="text-sm text-slate-300"
                  >
                    Repositories to display:
                  </label>

                  <select
                    id="repo-limit"
                    value={repoLimit}
                    onChange={(event) => {
                      setRepoLimit(Number(event.target.value));
                      setSelectedRepoIds(null);
                    }}
                    className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-medium text-[#24324a]"
                  >
                    <option value={6}>6</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                {selectableRepos.length > 0 && (
                  <details className="relative">
                    <summary className="cursor-pointer list-none rounded-lg border border-slate-500 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white">
                      Choose repositories
                    </summary>

                    <div className="absolute left-1/2 z-20 mt-3 w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl bg-[#f7f8fa] p-4 text-left text-[#24324a] shadow-xl sm:p-5">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold">
                          Selected repositories
                        </p>

                        <span className="rounded-full bg-[#24324a] px-3 py-1 text-xs font-medium text-white">
                          {displayedRepos.length} / {repoLimit}
                        </span>
                      </div>

                      {displayedRepos.length > 0 && (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {displayedRepos.map((repo, index) => (
                            <div
                              key={repo.id}
                              className="flex items-center gap-2 rounded-lg border border-[#cbd3df] bg-white px-3 py-2.5 text-sm font-medium transition hover:border-[#40577d]"
                            >
                              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked
                                  onChange={() => handleRepoToggle(repo.id)}
                                  className="size-4 cursor-pointer accent-[#40577d]"
                                />

                                <span className="min-w-0 wrap-break-word">
                                  {repo.name}
                                </span>
                              </label>

                              <div className="flex shrink-0 gap-1">
                                <button
                                  type="button"
                                  aria-label={`Move ${repo.name} up`}
                                  disabled={index === 0}
                                  onClick={() => handleRepoMove(index, "up")}
                                  className="cursor-pointer rounded px-2 py-1 text-[#40577d] hover:bg-[#eef1f6] disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  ↑
                                </button>

                                <button
                                  type="button"
                                  aria-label={`Move ${repo.name} down`}
                                  disabled={index === displayedRepos.length - 1}
                                  onClick={() => handleRepoMove(index, "down")}
                                  className="cursor-pointer rounded px-2 py-1 text-[#40577d] hover:bg-[#eef1f6] disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  ↓
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedRepoIds !== null && (
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedRepoIds(null)}
                            className="cursor-pointer rounded-md border border-[#cbd3df] bg-white px-3 py-1.5 text-xs font-medium text-[#40577d] transition hover:border-[#40577d] hover:bg-[#eef1f6]"
                          >
                            Reset selection
                          </button>
                        </div>
                      )}

                      {otherRepos.length > 0 && (
                        <div className="mt-5 border-t border-[#d9dde5] pt-4">
                          <p className="mb-3 text-sm font-semibold text-gray-600">
                            Other repositories
                          </p>

                          <div className="max-h-48 overflow-y-auto pr-1">
                            <div className="grid gap-2 sm:grid-cols-2">
                              {otherRepos.map((repo) => (
                                <label
                                  key={repo.id}
                                  className={`flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm transition ${
                                    displayedRepos.length >= repoLimit
                                      ? "cursor-not-allowed text-gray-400"
                                      : "cursor-pointer hover:border-[#cbd3df] hover:bg-white"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={false}
                                    disabled={
                                      displayedRepos.length >= repoLimit
                                    }
                                    onChange={() => handleRepoToggle(repo.id)}
                                    className="size-4 cursor-pointer accent-[#40577d] disabled:cursor-not-allowed"
                                  />

                                  <span className="min-w-0 wrap-break-word">
                                    {repo.name}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>

              {loading && <p className="mt-4 text-slate-300">Loading...</p>}

              {error && <p className="mt-4 text-red-300">{error}</p>}
            </section>

            <div className="flex justify-end print:hidden">
              <button
                onClick={() => window.print()}
                className="cursor-pointer rounded-lg border-2 border-[#24324a] bg-white px-5 py-3 font-medium text-[#24324a] transition hover:bg-[#24324a] hover:text-white"
              >
                Download PDF
              </button>
            </div>

            {/* Resume */}
            <div className="rounded-2xl bg-white p-5 shadow-lg sm:p-10 md:grid md:grid-cols-[16rem_minmax(0,1fr)] md:gap-x-8 print:rounded-none print:p-0 print:text-sm print:shadow-none">
              {/* User header */}
              <aside className="bg-[#eef2f6] p-6 text-center md:col-start-1 md:row-span-2">
                <Image
                  src={user.avatar_url}
                  alt={`${user.login} avatar`}
                  width={80}
                  height={80}
                  className="mx-auto rounded-full border print:h-14 print:w-14"
                />

                <div className="mt-4">
                  <p className="text-2xl font-semibold text-[#18233a] print:text-xl">
                    {user.login}
                  </p>

                  {user.name && (
                    <p className="mt-1 text-sm text-gray-700">{user.name}</p>
                  )}

                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-[#356fd3] hover:underline"
                  >
                    View GitHub profile
                  </a>

                  <div className="mt-5 space-y-2 text-sm text-[#4f5d6d]">
                    {user.location && <p>{user.location}</p>}
                    {user.company && <p>{user.company}</p>}
                  </div>

                  <div className="mt-8 border-t border-[#cbd3df] pt-6 text-left">
                    <h2 className="mb-4 border-b border-[#d9dde5] pb-2 text-xl font-semibold text-[#18233a] print:mb-2 print:text-lg">
                      GitHub activity
                    </h2>

                    <div className="space-y-3 text-sm text-[#4f5d6d]">
                      <div className="flex justify-between gap-4">
                        <span>Public repositories</span>
                        <strong className="font-semibold text-[#18233a]">
                          {user.public_repos}
                        </strong>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span>Total stars</span>
                        <strong className="font-semibold text-[#18233a]">
                          {selectableRepos.reduce(
                            (total, repo) => total + repo.stargazers_count,
                            0,
                          )}
                        </strong>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span>Total forks</span>
                        <strong className="text-[#24324a]">
                          {selectableRepos.reduce(
                            (total, repo) => total + repo.forks_count,
                            0,
                          )}
                        </strong>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span>Updated in 12 months</span>
                        <strong className="font-semibold text-[#18233a]">
                          {
                            selectableRepos.filter(
                              (repo) =>
                                new Date(repo.updated_at).getTime() >=
                                TWELVE_MONTHS_AGO,
                            ).length
                          }
                        </strong>
                      </div>
                    </div>
                  </div>

                  {topLanguages.length > 0 && (
                    <div className="mt-8 border-t border-[#d9dde5] pt-6 text-left">
                      <h2 className="mb-4 border-b border-[#d9dde5] pb-2 text-xl font-semibold text-[#18233a] print:mb-2 print:text-lg">
                        Skills
                      </h2>

                      <ul className="flex flex-wrap gap-2">
                        {topLanguages.map(([language, count]) => (
                          <li
                            key={language}
                            className="rounded-full bg-[#dfe7f2] px-3 py-1.5 text-sm font-medium text-[#34445e]"
                          >
                            {language} ({count})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </aside>

              <div className="my-8 h-px bg-[#d9dde5] md:hidden print:my-2.5" />

              {/* About */}
              {(user.bio || user.location || user.company) && (
                <section className="w-full text-left md:col-start-2">
                  <h2 className="mb-4 border-b border-[#d9dde5] pb-2 text-xl font-semibold text-[#18233a] print:mb-2 print:text-lg">
                    About
                  </h2>

                  {user.bio && (
                    <p className="leading-relaxed text-gray-700 print:text-sm print:leading-normal">
                      {user.bio}
                    </p>
                  )}
                </section>
              )}

              <div className="my-8 h-px bg-[#d9dde5] md:hidden print:my-2.5" />

              {/* Top repositories */}
              {displayedRepos.length === 0 && (
                <p className="text-left text-gray-600">
                  No repositories to display.
                </p>
              )}

              {displayedRepos.length > 0 && (
                <section className="w-full text-left md:col-start-2">
                  <h2 className="mb-4 border-b border-[#d9dde5] pb-2 text-xl font-semibold text-[#18233a] print:mb-2 print:text-lg">
                    Top Repositories
                  </h2>

                  <div className="space-y-3">
                    {displayedRepos.map((repo) => (
                      <article
                        key={repo.id}
                        className="w-full rounded-lg border border-[#d9e0e8] bg-white p-4 print:break-inside-avoid print:p-3"
                      >
                        <div className="flex flex-col items-start gap-3 md:flex-row md:justify-between md:gap-4 print:flex-row print:justify-between print:gap-3">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-0 wrap-break-word text-lg font-semibold text-[#40577d] hover:underline print:text-base"
                          >
                            {repo.name}
                          </a>

                          <div className="flex shrink-0 items-center gap-3 text-sm font-medium text-[#5f6b7a]">
                            <span>★ {repo.stargazers_count}</span>

                            <span className="flex items-center gap-1">
                              <svg
                                viewBox="0 0 16 16"
                                width="14"
                                height="14"
                                aria-hidden="true"
                                fill="currentColor"
                              >
                                <path d="M5 3.25a2.25 2.25 0 1 1-3 2.122V6.5A2.5 2.5 0 0 0 4.5 9h2v1.628a2.251 2.251 0 1 1-1 0V9h2A2.5 2.5 0 0 0 10 6.5V5.372a2.25 2.25 0 1 1 1 0V6.5A3.5 3.5 0 0 1 7.5 10h-1v.628a2.25 2.25 0 1 1-1 0V10h-1A3.5 3.5 0 0 1 1 6.5V5.372A2.25 2.25 0 0 1 5 3.25Z" />
                              </svg>

                              {repo.forks_count}
                            </span>
                          </div>
                        </div>

                        {repo.description && (
                          <p className="mt-3 leading-relaxed text-gray-700 print:mt-2 print:text-sm print:leading-normal">
                            {repo.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#667085] print:mt-2 print:gap-3">
                          {repo.language && (
                            <span className="rounded-full bg-[#e8eef6] px-2.5 py-1 text-xs font-medium text-[#40577d]">
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
          </div>
        )}
      </main>
    </div>
  );
}
