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

  try {
    // fetch GitHub user
    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: { "User-Agent": "github-resume-generator" },
      cache: "no-store",
    });

    console.log("GitHub status:", userRes.status); // debug

    if (!userRes.ok) {
      // not found
      const error: ApiError = { error: "User not found" };
      return NextResponse.json(error, { status: userRes.status });
    }

    const user: GitHubUser = await userRes.json();

    // fetch repos
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100`,
      {
        headers: {
          "User-Agent": "github-resume-generator",
        },

        cache: "no-store",
      },
    );

    const repos: GitHubRepo[] = await reposRes.json();

    // return data
    const data: ResumeResponse = { user, repos };
    return NextResponse.json(data);
  } catch {
    // fallback
    const error: ApiError = { error: "Server error" };
    return NextResponse.json(error, { status: 500 });
  }
}
