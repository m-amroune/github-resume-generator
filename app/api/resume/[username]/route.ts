import { NextResponse } from "next/server";

type GitHubUser = {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
};

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

type ApiError = {
  error: string;
};

// GET handler for /api/resume/[username]
export async function GET(
  request: Request,
  context: { params: Promise<{ username: string }> },
) {
  const { username } = await context.params;
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    const error: ApiError = { error: "Server configuration error" };
    return NextResponse.json(error, { status: 500 });
  }

  const headers = {
    Authorization: `Bearer ${githubToken}`,
    "User-Agent": "github-resume-generator",
  };

  try {
    // Fetch GitHub user
    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers,
      cache: "no-store",
    });

    if (userRes.status === 404) {
      const error: ApiError = { error: "User not found" };
      return NextResponse.json(error, { status: 404 });
    }

    if (!userRes.ok) {
      const error: ApiError = { error: "GitHub API error" };
      return NextResponse.json(error, { status: userRes.status });
    }

    const user: GitHubUser = await userRes.json();

    // Fetch repositories
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100`,
      {
        headers,
        cache: "no-store",
      },
    );

    if (!reposRes.ok) {
      const error: ApiError = { error: "Repository fetch failed" };
      return NextResponse.json(error, { status: reposRes.status });
    }

    const repos: GitHubRepo[] = await reposRes.json();

    // Return data
    const data: ResumeResponse = { user, repos };
    return NextResponse.json(data);
  } catch {
    const error: ApiError = { error: "Server error" };
    return NextResponse.json(error, { status: 500 });
  }
}