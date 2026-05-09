import { NextResponse } from "next/server";

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
      return NextResponse.json(
        { error: "User not found" },
        { status: userRes.status },
      );
    }

    const user = await userRes.json();

    // fetch repos
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100`,
      {
        headers: { "User-Agent": "github-resume-generator" },
        cache: "no-store",
      },
    );

    const repos = await reposRes.json();

    // return data
    return NextResponse.json({ user, repos });
  } catch {
    // fallback
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
