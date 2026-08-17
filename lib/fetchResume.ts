export type GitHubUser = {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
};

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

export type ResumeResponse = {
  user: GitHubUser;
  repos: GitHubRepo[];
};

export async function fetchResume(
  username: string,
): Promise<ResumeResponse> {
 let res: Response;

try {
  res = await fetch(`/api/resume/${username}`);
} catch {
  throw new Error("Server error");
}

  if (!res.ok) {
    const data = (await res.json()) as { error?: string };

    throw new Error(data.error ?? "Error");
  }

  return res.json() as Promise<ResumeResponse>;
}