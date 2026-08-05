import {
  selectTopRepos,
  type GitHubRepo,
} from "./selectTopRepos";

describe("selectTopRepos", () => {
  it("excludes forks", () => {
    const repos: GitHubRepo[] = [
      {
        id: 1,
        name: "main-project",
        description: "Main project",
        html_url: "https://github.com/test/main-project",
        stargazers_count: 2,
        fork: false,
        language: "TypeScript",
        updated_at: "2026-08-05T12:00:00Z",
      },
      {
        id: 2,
        name: "forked-project",
        description: "Forked project",
        html_url: "https://github.com/test/forked-project",
        stargazers_count: 10,
        fork: true,
        language: "JavaScript",
        updated_at: "2026-08-05T12:00:00Z",
      },
    ];

    const result = selectTopRepos(repos);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("main-project");
  });
  it("excludes repositories without a description", () => {
  const repos: GitHubRepo[] = [
    {
      id: 1,
      name: "documented-project",
      description: "Project description",
      html_url: "https://github.com/test/documented-project",
      stargazers_count: 2,
      fork: false,
      language: "TypeScript",
      updated_at: "2026-08-05T12:00:00Z",
    },
    {
      id: 2,
      name: "project-without-description",
      description: null,
      html_url: "https://github.com/test/project-without-description",
      stargazers_count: 10,
      fork: false,
      language: "JavaScript",
      updated_at: "2026-08-05T12:00:00Z",
    },
  ];

  const result = selectTopRepos(repos);

  expect(result).toHaveLength(1);
  expect(result[0].name).toBe("documented-project");
});
it("sorts repositories by stars", () => {
  const repos: GitHubRepo[] = [
    {
      id: 1,
      name: "two-stars",
      description: "Project with two stars",
      html_url: "https://github.com/test/two-stars",
      stargazers_count: 2,
      fork: false,
      language: "TypeScript",
      updated_at: "2026-08-05T12:00:00Z",
    },
    {
      id: 2,
      name: "ten-stars",
      description: "Project with ten stars",
      html_url: "https://github.com/test/ten-stars",
      stargazers_count: 10,
      fork: false,
      language: "JavaScript",
      updated_at: "2026-08-04T12:00:00Z",
    },
    {
      id: 3,
      name: "five-stars",
      description: "Project with five stars",
      html_url: "https://github.com/test/five-stars",
      stargazers_count: 5,
      fork: false,
      language: "CSS",
      updated_at: "2026-08-03T12:00:00Z",
    },
  ];

  const result = selectTopRepos(repos);

  expect(result.map((repo) => repo.name)).toEqual([
    "ten-stars",
    "five-stars",
    "two-stars",
  ]);
});
it("limits the result to 6 repositories", () => {
  const repos: GitHubRepo[] = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    name: `project-${index + 1}`,
    description: "Project description",
    html_url: `https://github.com/test/project-${index + 1}`,
    stargazers_count: 7 - index,
    fork: false,
    language: "TypeScript",
    updated_at: "2026-08-05T12:00:00Z",
  }));

  const result = selectTopRepos(repos);

  expect(result).toHaveLength(6);
});
it("sorts repositories by update date when none have stars", () => {
  const repos: GitHubRepo[] = [
    {
      id: 1,
      name: "older-project",
      description: "Older project",
      html_url: "https://github.com/test/older-project",
      stargazers_count: 0,
      fork: false,
      language: "TypeScript",
      updated_at: "2026-07-20T12:00:00Z",
    },
    {
      id: 2,
      name: "latest-project",
      description: "Latest project",
      html_url: "https://github.com/test/latest-project",
      stargazers_count: 0,
      fork: false,
      language: "JavaScript",
      updated_at: "2026-08-05T12:00:00Z",
    },
    {
      id: 3,
      name: "middle-project",
      description: "Middle project",
      html_url: "https://github.com/test/middle-project",
      stargazers_count: 0,
      fork: false,
      language: "CSS",
      updated_at: "2026-08-01T12:00:00Z",
    },
  ];

  const result = selectTopRepos(repos);

  expect(result.map((repo) => repo.name)).toEqual([
    "latest-project",
    "middle-project",
    "older-project",
  ]);
});
});