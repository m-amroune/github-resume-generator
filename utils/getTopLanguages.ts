import type { GitHubRepo } from "./selectTopRepos";

  // Compute top languages from repositories
export const getTopLanguages = (
  repos: GitHubRepo[],
): [string, number][] => {
  return Object.entries(
    repos.reduce((acc: Record<string, number>, repo) => {
      if (repo.language) {
        acc[repo.language] = (acc[repo.language] || 0) + 1;
      }

      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
};