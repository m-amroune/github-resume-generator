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

  // Compute top languages from repositories
  const topLanguages = getTopLanguages(displayedRepos);

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
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-10">
            {/* Initial search */}
            <div className="flex flex-col items-center text-center lg:pt-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                GitHub{" "}
                <span className="text-[#f4c95d]">
                  Resume Generator
                </span>
              </h1>

              <p className="mt-5 text-base text-slate-300 sm:text-lg">
                Generate a resume from a GitHub profile.
              </p>

              <div className="mt-8 w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-2 shadow-xl shadow-black/10">
                <SearchForm
                  onSubmit={handleGenerate}
                  disabled={loading}
                />
              </div>

              {loading && (
                <p className="mt-5 text-slate-300">
                  Loading...
                </p>
              )}

              {error && (
                <p className="mt-5 text-red-300">
                  {error}
                </p>
              )}
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

                  <div className="divide-y divide-gray-200">
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
              GitHub{" "}
              <span className="text-[#f4c95d]">
                Resume Generator
              </span>
            </h1>

            <p className="mt-3 text-base text-slate-300">
              Generate a resume from a GitHub profile.
            </p>

            <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-2 shadow-xl shadow-black/10">
              <SearchForm
                onSubmit={handleGenerate}
                disabled={loading}
              />
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
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
              <details className="mt-5">
                <summary className="mx-auto w-fit cursor-pointer rounded-lg border border-slate-500 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white">
                  Select repositories
                </summary>

                <div className="mx-auto mt-4 max-w-2xl rounded-xl bg-[#f7f8fa] p-4 text-left text-[#24324a] shadow-sm sm:p-5">
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
                              onChange={() =>
                                handleRepoToggle(repo.id)
                              }
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
                              onClick={() =>
                                handleRepoMove(index, "up")
                              }
                              className="cursor-pointer rounded px-2 py-1 text-[#40577d] hover:bg-[#eef1f6] disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              ↑
                            </button>

                            <button
                              type="button"
                              aria-label={`Move ${repo.name} down`}
                              disabled={
                                index === displayedRepos.length - 1
                              }
                              onClick={() =>
                                handleRepoMove(index, "down")
                              }
                              className="cursor-pointer rounded px-2 py-1 text-[#40577d] hover:bg-[#eef1f6] disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      ))}
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
                                onChange={() =>
                                  handleRepoToggle(repo.id)
                                }
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

            {loading && (
              <p className="mt-4 text-slate-300">
                Loading...
              </p>
            )}

            {error && (
              <p className="mt-4 text-red-300">
                {error}
              </p>
            )}
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
          <div className="rounded-2xl bg-white p-5 text-center shadow-lg sm:p-10 print:rounded-none print:p-0 print:text-sm print:shadow-none">
            {/* User header */}
            <div className="flex flex-col items-center gap-4 border-l-4 border-[#24324a] bg-[#f7f8fa] p-6 text-center sm:flex-row sm:gap-6 sm:text-left print:flex-row print:gap-3 print:p-3 print:text-left">
              <Image
                src={user.avatar_url}
                alt={`${user.login} avatar`}
                width={80}
                height={80}
                className="rounded-full border print:h-14 print:w-14"
              />

              <div className="flex flex-col space-y-1 text-center sm:text-left print:text-left">
                <p className="text-2xl font-semibold print:text-xl">
                  {user.login}
                </p>

                {user.name && (
                  <p className="text-sm text-gray-700">
                    {user.name}
                  </p>
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

            <div className="my-8 h-px bg-[#d9dde5] print:my-2.5" />

            {/* About */}
            {(user.bio || user.location || user.company) && (
              <section className="w-full border-l-4 border-[#24324a] pl-5 text-left print:pl-3">
                <h2 className="mb-4 inline-block border-b-2 border-[#f4c95d] pb-1 text-xl font-semibold text-[#24324a] print:mb-2 print:text-lg">
                  About
                </h2>

                {user.bio && (
                  <p className="leading-relaxed text-gray-700 print:text-sm print:leading-normal">
                    {user.bio}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 print:mt-2 print:gap-y-1">
                  {user.location && (
                    <p>Location: {user.location}</p>
                  )}

                  {user.company && (
                    <p>Company: {user.company}</p>
                  )}
                </div>
              </section>
            )}

            <div className="my-8 h-px bg-[#d9dde5] print:my-2.5" />

            {/* Skills */}
            {topLanguages.length > 0 && (
              <section className="w-full text-left">
                <h2 className="mb-4 inline-block border-b-2 border-[#f4c95d] pb-1 text-xl font-semibold text-[#24324a] print:mb-2 print:text-lg">
                  Skills
                </h2>

                <ul className="flex flex-wrap gap-3 print:gap-2">
                  {topLanguages.map(([language, count]) => (
                    <li
                      key={language}
                      className="rounded-full border border-[#f4c95d] bg-[#fff8e1] px-4 py-2 text-base font-medium text-[#24324a] print:px-2.5 print:py-1 print:text-sm"
                    >
                      {language} ({count})
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="my-8 h-px bg-[#d9dde5] print:my-2.5" />

            {/* Top repositories */}
            {displayedRepos.length === 0 && (
              <p className="text-left text-gray-600">
                No repositories to display.
              </p>
            )}

            {displayedRepos.length > 0 && (
              <section className="w-full text-left">
                <h2 className="mb-4 inline-block border-b-2 border-[#f4c95d] pb-1 text-xl font-semibold text-[#24324a] print:mb-2 print:text-lg">
                  Top Repositories
                </h2>

                <div className="divide-y divide-gray-200">
                  {displayedRepos.map((repo) => (
                    <article
                      key={repo.id}
                      className="w-full py-4 print:break-inside-avoid print:py-3"
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

                        <span className="shrink-0 rounded-full bg-[#fff8e1] px-3 py-1 text-sm font-medium text-[#24324a] print:px-2.5 print:py-1">
                          ⭐ {repo.stargazers_count}
                        </span>
                      </div>

                      {repo.description && (
                        <p className="mt-3 leading-relaxed text-gray-700 print:mt-2 print:text-sm print:leading-normal">
                          {repo.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-3 text-sm text-gray-600 print:mt-2 print:gap-3 print:pt-2">
                        {repo.language && (
                          <span className="rounded-md border border-[#cbd3df] bg-[#eef1f6] px-2.5 py-1 font-medium text-[#40577d]">
                            {repo.language}
                          </span>
                        )}

                        <span>
                          {getDaysAgo(repo.updated_at)}
                        </span>
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
