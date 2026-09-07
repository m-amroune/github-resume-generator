"use client";

import SearchForm from "@/components/SearchForm";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchResume } from "@/lib/fetchResume";
import Image from "next/image";
import { selectTopRepos, type GitHubRepo } from "@/utils/selectTopRepos";
import { getTopLanguages } from "@/utils/getTopLanguages";
import {
  BookMarked,
  Building2,
  CalendarDays,
  Clock,
  GitFork,
  Link,
  MapPin,
  Star,
  Download,
  List,
} from "lucide-react";
const TWELVE_MONTHS_AGO = Date.now() - 365 * 24 * 60 * 60 * 1000;

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

const getExternalUrl = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

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

  const totalStars = selectableRepos.reduce(
    (total, repo) => total + repo.stargazers_count,
    0,
  );

  const totalForks = selectableRepos.reduce(
    (total, repo) => total + repo.forks_count,
    0,
  );

  const updatedInTwelveMonths = selectableRepos.filter(
    (repo) => new Date(repo.updated_at).getTime() >= TWELVE_MONTHS_AGO,
  ).length;

  const otherRepos = selectableRepos.filter(
    (repo) =>
      !displayedRepos.some((selectedRepo) => selectedRepo.id === repo.id),
  );

  // Compute top languages from all non-fork repositories
  const topLanguages = getTopLanguages(selectableRepos);

  const repositoriesWithLanguage = selectableRepos.filter(
    (repo) => repo.language,
  ).length;

  const languagePercentages = topLanguages.map(([language, count]) => ({
    language,
    percentage:
      repositoriesWithLanguage > 0
        ? Math.round((count / repositoriesWithLanguage) * 100)
        : 0,
  }));

  const topLanguagesCount = topLanguages.reduce(
    (total, [, count]) => total + count,
    0,
  );

  const otherLanguagesCount = repositoriesWithLanguage - topLanguagesCount;

  if (otherLanguagesCount > 0) {
    languagePercentages.push({
      language: "Other",
      percentage: Math.round(
        (otherLanguagesCount / repositoriesWithLanguage) * 100,
      ),
    });
  }

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
          user ? "px-4 py-10" : "px-4 py-8 sm:px-6 lg:py-12"
        }`}
      >
        {!user ? (
          <section className="mx-auto w-full max-w-6xl overflow-hidden rounded-xl bg-[#41586d] text-white shadow-md print:hidden">
            <div className="relative w-full px-6 py-7 lg:min-h-128 lg:px-10">
              {/* Initial search */}
              <div className="flex flex-col items-center justify-center text-center lg:mr-100 lg:min-h-112">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  GitHub Resume Generator
                </h1>

                <p className="mt-3 text-base text-slate-200">
                  Generate a resume from a GitHub profile.
                </p>

                <div className="mt-7 w-full max-w-2xl">
                  <SearchForm onSubmit={handleGenerate} disabled={loading} />
                </div>

                {loading && <p className="mt-5 text-slate-300">Loading...</p>}

                {error && <p className="mt-5 text-red-300">{error}</p>}
              </div>

{/* Resume preview */}
<div className="hidden lg:absolute lg:right-8 lg:top-1/2 lg:block lg:w-85 lg:-translate-y-1/2">
  <div className="pointer-events-none aspect-210/297 w-full select-none overflow-hidden rounded-md bg-white text-left text-[#18233a] shadow-md">
    <div className="grid h-full grid-cols-[38%_62%]">
      {/* Sidebar */}
      <div className="bg-[#e9eef4] px-3.5 py-4">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#40577d]">
          DEV
        </div>

        <div className="mt-2.5">
          <p className="text-[10px] font-bold leading-tight">
            devprofile
          </p>
          <p className="mt-0.5 text-[6.5px] text-[#667085]">
            GitHub User
          </p>
        </div>

        <div className="mt-2.5 space-y-1.5 text-[6.5px] leading-tight text-[#4f5d6d]">
          <p>San Francisco, California</p>
          <p className="text-[#356fd3]">
            github.com/devprofile
          </p>
          <p className="text-[#356fd3]">
            devprofile.dev
          </p>
          <p>Joined Jan 2020</p>
        </div>

        <div className="my-2.5 border-t border-[#c5ced9]" />

        <p className="text-[7px] font-bold tracking-[0.08em]">
          GITHUB ACTIVITY
        </p>

        <div className="mt-1.5 space-y-1.5 text-[6.5px]">
          <div>
            <p className="font-semibold">Public repositories</p>
            <p className="text-[#667085]">42</p>
          </div>

          <div>
            <p className="font-semibold">Total stars</p>
            <p className="text-[#667085]">12,480</p>
          </div>

          <div>
            <p className="font-semibold">Total forks</p>
            <p className="text-[#667085]">3,810</p>
          </div>

          <div>
            <p className="font-semibold">Updated in 12 months</p>
            <p className="text-[#667085]">18</p>
          </div>
        </div>

        <div className="my-2.5 border-t border-[#c5ced9]" />

        <p className="text-[7px] font-bold tracking-[0.08em]">
          LANGUAGES
        </p>

        <div className="mt-1.5 space-y-1.5">
          {[
            { language: "TypeScript", percentage: 42 },
            { language: "JavaScript", percentage: 28 },
            { language: "Python", percentage: 14 },
            { language: "Rust", percentage: 10 },
            { language: "Other", percentage: 6 },
          ].map(({ language, percentage }) => (
            <div key={language}>
              <div className="mb-0.5 flex justify-between gap-1 text-[6px] text-[#4f5d6d]">
                <span>{language}</span>
                <span>{percentage}%</span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-sm bg-[#d6dee7]">
                <div
                  className="h-full bg-[#40577d]"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 py-4">
        {/* About */}
        <section>
          <p className="border-b border-[#cbd3df] pb-1.5 text-[9.5px] font-bold">
            About
          </p>

          <div className="mt-2 space-y-1.5">
            <div className="h-2 w-full rounded bg-[#d5dbe4]" />
            <div className="h-2 w-[88%] rounded bg-[#d5dbe4]" />
            <div className="h-2 w-[68%] rounded bg-[#d5dbe4]" />
          </div>
        </section>

        {/* Top repositories */}
        <section className="mt-3.5">
          <p className="border-b border-[#cbd3df] pb-1.5 text-[9.5px] font-bold">
            Top Repositories
          </p>

          <div className="divide-y divide-[#d6dde6]">
            {[
              {
                name: "ui-toolkit",
                description: "Reusable UI components for modern web apps.",
                language: "TypeScript",
                stars: "1,240",
                forks: "320",
              },
              {
                name: "api-client",
                description: "Lightweight client for public web APIs.",
                language: "JavaScript",
                stars: "892",
                forks: "214",
              },
              {
                name: "data-visualizer",
                description: "Interactive charts and data visualization.",
                language: "Python",
                stars: "456",
                forks: "98",
              },
              {
                name: "docs-site",
                description: "Documentation website for developer tools.",
                language: "TypeScript",
                stars: "321",
                forks: "76",
              },
              {
                name: "task-automation",
                description: "Utilities for automating development tasks.",
                language: "Rust",
                stars: "237",
                forks: "61",
              },
              {
                name: "cli-tools",
                description: "Command-line utilities for developer workflows.",
                language: "Go",
                stars: "184",
                forks: "43",
              },
            ].map((repo) => (
              <article key={repo.name} className="py-1.5">
                <div className="flex items-start justify-between gap-1">
                  <p className="text-[7.5px] font-bold text-[#356fd3]">
                    {repo.name}
                  </p>

                  <div className="flex shrink-0 gap-1.5 text-[5px] text-[#667085]">
                    <span>★ {repo.stars}</span>
                    <span>⑂ {repo.forks}</span>
                  </div>
                </div>

                <p className="mt-0.5 text-[5.7px] leading-tight text-[#344054]">
                  {repo.description}
                </p>

                <div className="mt-1 flex items-center gap-1 text-[5px] text-[#667085]">
                  <span className="font-medium text-[#40577d]">
                    {repo.language}
                  </span>
                  <span>•</span>
                  <span>Last updated: Sep 2026</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  </div>
</div>
            </div>
          </section>
        ) : (
          <div className="mx-auto max-w-4xl space-y-8 print:w-full print:max-w-none print:space-y-0">
            {/* Search and repository controls */}
            <section className="rounded-xl bg-[#41586d] px-6 py-5 text-white shadow-md print:hidden">
              {/* Title */}
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight">
                  GitHub Resume Generator
                </h1>
              </div>

              {/* Search */}
              <div className="mt-5 w-full">
                <SearchForm
                  onSubmit={handleGenerate}
                  disabled={loading}
                  variant="compact"
                  submitLabel="Regenerate"
                />
              </div>

              {/* Bottom row */}
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-sm text-slate-100">Display</span>

                  <select
                    id="repo-limit"
                    value={repoLimit}
                    onChange={(event) => {
                      setRepoLimit(Number(event.target.value));
                      setSelectedRepoIds(null);
                    }}
                    className="cursor-pointer rounded-md border border-white/30 bg-white px-3 py-2 text-sm font-semibold text-[#18233a] outline-none"
                  >
                    <option value={6}>6</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>

                  <span className="text-sm text-slate-100">repositories</span>

                  {selectableRepos.length > 0 && (
                    <details className="relative">
                      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-white/50 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                        <List size={16} aria-hidden="true" />
                        Choose repositories
                      </summary>

                      <div className="absolute left-1/2 z-20 mt-3 w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-[#d9dde5] bg-[#f7f8fa] p-4 text-left text-[#24324a] shadow-xl sm:p-5">
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
                                className="flex items-center gap-2 rounded-lg border border-[#cbd3df] bg-white px-3 py-2.5 text-sm font-medium"
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

                        {selectedRepoIds !== null && (
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setSelectedRepoIds(null)}
                              className="cursor-pointer rounded-md border border-[#cbd3df] bg-white px-3 py-1.5 text-xs font-medium text-[#40577d]"
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
                                    className={`flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm ${
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

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#1f3850] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#172d42] sm:ml-auto"
                >
                  <Download size={17} aria-hidden="true" />
                  Download PDF
                </button>
              </div>

              {loading && (
                <p className="mt-3 text-sm text-slate-200">Loading...</p>
              )}

              {error && <p className="mt-3 text-sm text-red-200">{error}</p>}
            </section>

            {/* Resume */}
            <div className="overflow-hidden bg-white shadow-lg md:grid md:grid-cols-[18rem_minmax(0,1fr)] print:grid print:w-full print:grid-cols-[17rem_minmax(0,1fr)] print:text-sm print:shadow-none">
              {/* Sidebar */}
              <aside className="bg-[#e9eef4] px-6 py-7 text-left md:row-span-2 print:row-span-2 print:px-5 print:py-5">
                <Image
                  src={user.avatar_url}
                  alt={`${user.login} avatar`}
                  width={80}
                  height={80}
                  className="mx-auto rounded-full border border-white print:h-14 print:w-14"
                />

                {/* Identity */}
                <div className="mt-5">
                  <p className="text-2xl font-semibold leading-tight text-[#18233a] print:text-xl">
                    {user.login}
                  </p>

                  {user.name && (
                    <p className="mt-1 text-sm text-[#4f5d6d]">{user.name}</p>
                  )}

                  <div className="mt-5 space-y-3 text-sm text-[#4f5d6d]">
                    {user.location && (
                      <div className="flex items-start gap-2.5">
                        <MapPin
                          size={16}
                          strokeWidth={1.8}
                          className="mt-0.5 shrink-0 text-[#18233a]"
                          aria-hidden="true"
                        />
                        <span>{user.location}</span>
                      </div>
                    )}

                    <div className="flex items-start gap-2.5">
                      <Link
                        size={16}
                        strokeWidth={1.8}
                        className="mt-0.5 shrink-0 text-[#18233a]"
                        aria-hidden="true"
                      />

                      <a
                        href={user.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 break-all text-[#356fd3] hover:underline"
                      >
                        {user.html_url}
                      </a>
                    </div>

                    {user.blog && (
                      <div className="flex items-start gap-2.5">
                        <Link
                          size={16}
                          strokeWidth={1.8}
                          className="mt-0.5 shrink-0 text-[#18233a]"
                          aria-hidden="true"
                        />

                        <a
                          href={getExternalUrl(user.blog)}
                          target="_blank"
                          rel="noreferrer"
                          className="min-w-0 break-all text-[#356fd3] hover:underline"
                        >
                          {user.blog}
                        </a>
                      </div>
                    )}

                    {user.company && (
                      <div className="flex items-start gap-2.5">
                        <Building2
                          size={16}
                          strokeWidth={1.8}
                          className="mt-0.5 shrink-0 text-[#18233a]"
                          aria-hidden="true"
                        />
                        <span>{user.company}</span>
                      </div>
                    )}

                    <div className="flex items-start gap-2.5">
                      <CalendarDays
                        size={16}
                        strokeWidth={1.8}
                        className="mt-0.5 shrink-0 text-[#18233a]"
                        aria-hidden="true"
                      />

                      <span>
                        Joined{" "}
                        {MONTH_YEAR_FORMATTER.format(new Date(user.created_at))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* GitHub activity */}
                <section className="mt-7 border-t border-[#c5ced9] pt-5">
                  <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.12em] text-[#18233a]">
                    GitHub activity
                  </h2>

                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <BookMarked
                        size={15}
                        strokeWidth={1.8}
                        className="shrink-0 text-[#18233a]"
                        aria-hidden="true"
                      />

                      <div>
                        <p className="font-semibold text-[#18233a]">
                          Public repositories
                        </p>
                        <p className="mt-0.5 text-[#4f5d6d]">
                          {NUMBER_FORMATTER.format(user.public_repos)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Star
                        size={18}
                        strokeWidth={1.8}
                        className="mt-0.5 shrink-0 text-[#18233a]"
                        aria-hidden="true"
                      />

                      <div>
                        <p className="font-semibold text-[#18233a]">
                          Total stars
                        </p>
                        <p className="mt-0.5 text-[#4f5d6d]">
                          {NUMBER_FORMATTER.format(totalStars)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <GitFork
                        size={18}
                        strokeWidth={1.8}
                        className="mt-0.5 shrink-0 text-[#18233a]"
                        aria-hidden="true"
                      />

                      <div>
                        <p className="font-semibold text-[#18233a]">
                          Total forks
                        </p>
                        <p className="mt-0.5 text-[#4f5d6d]">
                          {NUMBER_FORMATTER.format(totalForks)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock
                        size={18}
                        strokeWidth={1.8}
                        className="mt-0.5 shrink-0 text-[#18233a]"
                        aria-hidden="true"
                      />

                      <div>
                        <p className="font-semibold text-[#18233a]">
                          Updated in 12 months
                        </p>
                        <p className="mt-0.5 text-[#4f5d6d]">
                          {NUMBER_FORMATTER.format(updatedInTwelveMonths)}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Languages */}
                {languagePercentages.length > 0 && (
                  <section className="mt-7 border-t border-[#c5ced9] pt-5">
                    <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.12em] text-[#18233a]">
                      Languages
                    </h2>

                    <ul className="space-y-3">
                      {languagePercentages.map(({ language, percentage }) => (
                        <li key={language}>
                          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                            <span className="text-[#34445e]">{language}</span>

                            <span className="text-[#4f5d6d]">
                              {percentage}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-sm bg-[#d6dee7]">
                            <div
                              className="h-full bg-[#40577d]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </aside>

              <div className="my-8 h-px bg-[#d9dde5] md:hidden print:my-2.5" />

              {/* About */}
              {user.bio && (
                <section className="px-6 pt-6 text-left print:px-5 print:pt-5">
                  <h2 className="mb-3 border-b border-[#cbd3df] pb-1.5 text-lg font-semibold text-[#18233a]">
                    About
                  </h2>

                  <p className="text-sm leading-relaxed text-[#344054] print:leading-normal">
                    {user.bio}
                  </p>
                </section>
              )}

              {/* Top repositories */}
              {displayedRepos.length === 0 && (
                <p className="px-8 pb-7 pt-6 text-left text-gray-600 print:px-6">
                  No repositories to display.
                </p>
              )}

              {displayedRepos.length > 0 && (
                <section
                  className={`px-6 pb-6 text-left print:px-5 print:pb-5 ${
                    user.bio ? "pt-3" : "pt-6"
                  }`}
                >
                  <h2 className="mb-3 border-b border-[#cbd3df] pb-1.5 text-lg font-semibold text-[#18233a]">
                    Top Repositories
                  </h2>

                  <div className="space-y-0">
                    {displayedRepos.map((repo) => (
                      <article
                        key={repo.id}
                        className="border-b border-[#d6dde6] py-4 print:break-inside-avoid last:border-b-0 last:pb-0 first:pt-0"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex min-w-0 items-center gap-2 text-base font-bold leading-tight text-[#356fd3] hover:underline"
                          >
                            <BookMarked
                              size={15}
                              strokeWidth={1.8}
                              className="mt-0.5 shrink-0 text-[#18233a]"
                              aria-hidden="true"
                            />

                            <span className="min-w-0 wrap-break-word">
                              {repo.name}
                            </span>
                          </a>

                          <div className="mt-0.5 flex shrink-0 items-center gap-3 text-[11px] font-medium text-[#5f6b7a]">
                            <span className="flex items-center gap-1">
                              <Star
                                size={13}
                                strokeWidth={1.8}
                                aria-hidden="true"
                              />
                              {NUMBER_FORMATTER.format(repo.stargazers_count)}
                            </span>

                            <span className="flex items-center gap-1">
                              <GitFork
                                size={13}
                                strokeWidth={1.8}
                                aria-hidden="true"
                              />
                              {NUMBER_FORMATTER.format(repo.forks_count)}
                            </span>
                          </div>
                        </div>

                        {repo.description && (
                          <p className="mt-1.5 pl-6 text-[13px] leading-relaxed text-[#344054]">
                            {repo.description}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-2 pl-6 text-[11px] text-[#667085]">
                          {repo.language && (
                            <span className="font-medium text-[#40577d]">
                              {repo.language}
                            </span>
                          )}

                          {repo.language && <span aria-hidden="true">•</span>}

                          <span className="flex items-center gap-1.5">
                            <Clock
                              size={13}
                              strokeWidth={1.8}
                              aria-hidden="true"
                            />
                            Last updated:{" "}
                            {MONTH_YEAR_FORMATTER.format(
                              new Date(repo.updated_at),
                            )}
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

        {!user && (
          <section className="mx-auto mt-12 w-full max-w-6xl px-2 text-[#18233a] print:hidden">
            <h2 className="text-center text-2xl font-bold">How it works</h2>

            <div className="mt-8 grid border-y border-[#cbd3df] md:grid-cols-3">
              <div className="px-8 py-8 text-center md:border-r md:border-[#cbd3df]">
                <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-[#41586d] text-base font-bold text-white">
                  1
                </div>

                <h3 className="mt-4 text-lg font-bold">GitHub profile</h3>

                <p className="mx-auto mt-2 max-w-xs text-base leading-7 text-[#4f5d6d]">
                  Enter a public GitHub username
                </p>
              </div>

              <div className="border-t border-[#cbd3df] px-8 py-8 text-center md:border-r md:border-t-0 md:border-[#cbd3df]">
                <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-[#41586d] text-base font-bold text-white">
                  2
                </div>

                <h3 className="mt-4 text-lg font-bold">Repositories</h3>

                <p className="mx-auto mt-2 max-w-xs text-base leading-7 text-[#4f5d6d]">
                  Choose the repositories to display
                </p>
              </div>

              <div className="border-t border-[#cbd3df] px-8 py-8 text-center md:border-t-0">
                <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-[#41586d] text-base font-bold text-white">
                  3
                </div>

                <h3 className="mt-4 text-lg font-bold">Export PDF</h3>

                <p className="mx-auto mt-2 max-w-xs text-base leading-7 text-[#4f5d6d]">
                  Download the generated resume as a PDF
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
