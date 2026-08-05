import { getTopLanguages } from "./getTopLanguages";
import type { GitHubRepo } from "./selectTopRepos";

describe("getTopLanguages", () => {
  it("counts language occurrences", () => {
    const repos: GitHubRepo[] = [
      {
        id: 1,
        name: "project-1",
        description: "Project 1",
        html_url: "https://github.com/test/project-1",
        stargazers_count: 1,
        fork: false,
        language: "TypeScript",
        updated_at: "2026-08-05T12:00:00Z",
      },
      {
        id: 2,
        name: "project-2",
        description: "Project 2",
        html_url: "https://github.com/test/project-2",
        stargazers_count: 1,
        fork: false,
        language: "TypeScript",
        updated_at: "2026-08-05T12:00:00Z",
      },
      {
        id: 3,
        name: "project-3",
        description: "Project 3",
        html_url: "https://github.com/test/project-3",
        stargazers_count: 1,
        fork: false,
        language: "JavaScript",
        updated_at: "2026-08-05T12:00:00Z",
      },
    ];

    expect(getTopLanguages(repos)).toEqual([
      ["TypeScript", 2],
      ["JavaScript", 1],
    ]);
  });
  it("ignores repositories without a language", () => {
  const repos: GitHubRepo[] = [
    {
      id: 1,
      name: "typescript-project",
      description: "TypeScript project",
      html_url: "https://github.com/test/typescript-project",
      stargazers_count: 1,
      fork: false,
      language: "TypeScript",
      updated_at: "2026-08-05T12:00:00Z",
    },
    {
      id: 2,
      name: "no-language-project",
      description: "Project without a language",
      html_url: "https://github.com/test/no-language-project",
      stargazers_count: 1,
      fork: false,
      language: null,
      updated_at: "2026-08-05T12:00:00Z",
    },
  ];

  expect(getTopLanguages(repos)).toEqual([["TypeScript", 1]]);
});
it("sorts languages by frequency", () => {
  const repos: GitHubRepo[] = [
    {
      id: 1,
      name: "javascript-project",
      description: "JavaScript project",
      html_url: "https://github.com/test/javascript-project",
      stargazers_count: 1,
      fork: false,
      language: "JavaScript",
      updated_at: "2026-08-05T12:00:00Z",
    },
    {
      id: 2,
      name: "typescript-project-1",
      description: "TypeScript project",
      html_url: "https://github.com/test/typescript-project-1",
      stargazers_count: 1,
      fork: false,
      language: "TypeScript",
      updated_at: "2026-08-05T12:00:00Z",
    },
    {
      id: 3,
      name: "typescript-project-2",
      description: "TypeScript project",
      html_url: "https://github.com/test/typescript-project-2",
      stargazers_count: 1,
      fork: false,
      language: "TypeScript",
      updated_at: "2026-08-05T12:00:00Z",
    },
    {
      id: 4,
      name: "css-project",
      description: "CSS project",
      html_url: "https://github.com/test/css-project",
      stargazers_count: 1,
      fork: false,
      language: "CSS",
      updated_at: "2026-08-05T12:00:00Z",
    },
  ];

  expect(getTopLanguages(repos)).toEqual([
    ["TypeScript", 2],
    ["JavaScript", 1],
    ["CSS", 1],
  ]);
});
it("limits the result to 5 languages", () => {
  const languages = [
    "TypeScript",
    "JavaScript",
    "CSS",
    "HTML",
    "Python",
    "Java",
  ];

  const repos: GitHubRepo[] = languages.map((language, index) => ({
    id: index + 1,
    name: `project-${index + 1}`,
    description: "Project description",
    html_url: `https://github.com/test/project-${index + 1}`,
    stargazers_count: 1,
    fork: false,
    language,
    updated_at: "2026-08-05T12:00:00Z",
  }));

  const result = getTopLanguages(repos);

  expect(result).toHaveLength(5);
});
});