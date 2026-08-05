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

export const selectTopRepos = (repos: GitHubRepo[]): GitHubRepo[] => {
  const primaryRepos = repos
    .filter(
      (repo) => !repo.fork && repo.description && repo.stargazers_count > 0,
    )
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  if (primaryRepos.length > 0) {
    return primaryRepos;
  }

  return repos
    .filter((repo) => !repo.fork && repo.description)
    .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
    .slice(0, 6);
};