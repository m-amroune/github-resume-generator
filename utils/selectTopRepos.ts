// Repository data used in the UI
export type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  fork: boolean;
  language: string | null;
  updated_at: string;
};

export const selectTopRepos = (
  repos: GitHubRepo[],
  limit = 6,
): GitHubRepo[] => {
  const primaryRepos = repos
    .filter(
      (repo) =>
        !repo.fork &&
        repo.description &&
        repo.stargazers_count > 0,
    )
    .sort((a, b) => b.stargazers_count - a.stargazers_count);

  if (primaryRepos.length >= limit) {
    return primaryRepos.slice(0, limit);
  }

  const primaryIds = new Set(primaryRepos.map((repo) => repo.id));

  const fallbackRepos = repos
    .filter(
      (repo) =>
        !repo.fork &&
        repo.description &&
        !primaryIds.has(repo.id),
    )
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() -
        new Date(a.updated_at).getTime(),
    );

  return [...primaryRepos, ...fallbackRepos].slice(0, limit);
};