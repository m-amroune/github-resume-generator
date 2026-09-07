import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import Home from "./page";

type MockUser = {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  created_at: string;
  public_repos: number;
};

type MockRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  language: string | null;
  topics: string[];
  updated_at: string;
};

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

global.fetch = mockFetch;

const baseUser: MockUser = {
  login: "m-amroune",
  avatar_url: "https://avatars.githubusercontent.com/u/1",
  html_url: "https://github.com/m-amroune",
  name: "Moustapha Amroune",
  bio: null,
  location: null,
  company: null,
  blog: null,
  created_at: "2020-01-01T00:00:00Z",
  public_repos: 48,
};

function createUser(
  overrides: Partial<MockUser> = {},
): MockUser {
  return {
    ...baseUser,
    ...overrides,
  };
}

type CreateReposOptions = {
  owner?: string;
  prefix?: string;
  language?: string | ((index: number) => string);
};

function createRepos(
  count: number,
  {
    owner = "test",
    prefix = "project",
    language = "TypeScript",
  }: CreateReposOptions = {},
): MockRepo[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `${prefix}-${index + 1}`,
    description: "Project description",
    html_url: `https://github.com/${owner}/${prefix}-${index + 1}`,
    stargazers_count: count - index,
    forks_count: index + 1,
    fork: false,
    language:
      typeof language === "function"
        ? language(index)
        : language,
    topics: [],
    updated_at: "2026-08-05T12:00:00Z",
  }));
}

function mockSuccessfulResponse(
  user: MockUser,
  repos: MockRepo[],
) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user,
      repos,
    }),
  } as Response);
}

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>,
  );
}

function submitUsername(username: string) {
  const input = screen.getByPlaceholderText(
    "Enter a GitHub username...",
  );

  fireEvent.change(input, {
    target: { value: username },
  });

  fireEvent.submit(input.closest("form")!);
}

function openRepositoryPicker() {
  fireEvent.click(
    screen.getByText("Choose repositories"),
  );
}

describe("Home", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("displays loading while generating the resume", () => {
    mockFetch.mockImplementation(
      () => new Promise<Response>(() => {}),
    );

    renderHome();

    submitUsername("m-amroune");

    expect(
      screen.getByText("Loading..."),
    ).toBeInTheDocument();
  });

  it("displays the profile after a successful response", async () => {
    mockSuccessfulResponse(
      createUser({
        bio: "Front-end developer",
        location: "France",
      }),
      [],
    );

    renderHome();

    submitUsername("m-amroune");

    expect(
      await screen.findByText("m-amroune"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Front-end developer"),
    ).toBeInTheDocument();
  });

  it("displays the API error message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "User not found",
      }),
    } as Response);

    renderHome();

    submitUsername("unknown-user");

    expect(
      await screen.findByText("User not found"),
    ).toBeInTheDocument();
  });

  it("displays a message when there are no repositories", async () => {
    mockSuccessfulResponse(
      createUser(),
      [],
    );

    renderHome();

    submitUsername("m-amroune");

    expect(
      await screen.findByText(
        "No repositories to display.",
      ),
    ).toBeInTheDocument();
  });

  it("removes a repository from the resume when it is deselected", async () => {
    const repos = createRepos(7);

    mockSuccessfulResponse(
      createUser(),
      repos,
    );

    renderHome();

    submitUsername("m-amroune");

    await screen.findByRole("link", {
      name: "project-1",
    });

    openRepositoryPicker();

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "project-1",
      }),
    );

    expect(
      screen.queryByRole("link", {
        name: "project-1",
      }),
    ).not.toBeInTheDocument();
  });

  it("adds another repository after one is deselected", async () => {
    const repos = createRepos(7);

    mockSuccessfulResponse(
      createUser(),
      repos,
    );

    renderHome();

    submitUsername("m-amroune");

    await screen.findByRole("link", {
      name: "project-1",
    });

    openRepositoryPicker();

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "project-1",
      }),
    );

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "project-7",
      }),
    );

    expect(
      screen.queryByRole("link", {
        name: "project-1",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "project-7",
      }),
    ).toBeInTheDocument();
  });

  it("prevents selecting more repositories than the current limit", async () => {
    const repos = createRepos(7);

    mockSuccessfulResponse(
      createUser(),
      repos,
    );

    renderHome();

    submitUsername("m-amroune");

    await screen.findByRole("link", {
      name: "project-1",
    });

    openRepositoryPicker();

    expect(
      screen.getByRole("checkbox", {
        name: "project-7",
      }),
    ).toBeDisabled();
  });

  it("changes repository order in the resume", async () => {
    const repos = createRepos(3);

    mockSuccessfulResponse(
      createUser(),
      repos,
    );

    renderHome();

    submitUsername("m-amroune");

    await screen.findByRole("link", {
      name: "project-1",
    });

    openRepositoryPicker();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Move project-2 up",
      }),
    );

    const repoLinks = screen
      .getAllByRole("link")
      .filter((link) =>
        link
          .getAttribute("href")
          ?.includes("github.com/test/project-"),
      );

    expect(
      repoLinks.map((link) => link.textContent),
    ).toEqual([
      "project-2",
      "project-1",
      "project-3",
    ]);
  });

  it("computes languages from all non-fork repositories", async () => {
    const repos = createRepos(7, {
      language: (index) =>
        index === 6 ? "Python" : "TypeScript",
    });

    mockSuccessfulResponse(
      createUser(),
      repos,
    );

    renderHome();

    submitUsername("m-amroune");

    await screen.findByRole("link", {
      name: "project-1",
    });

    expect(
      screen.queryByRole("link", {
        name: "project-7",
      }),
    ).not.toBeInTheDocument();

    const languagesSection = screen
  .getByRole("heading", { name: "Languages" })
  .closest("section");

expect(languagesSection).not.toBeNull();

const languages = within(languagesSection!);

expect(
  languages.getByText("TypeScript"),
).toBeInTheDocument();

expect(
  languages.getByText("86%"),
).toBeInTheDocument();

expect(
  languages.getByText("Python"),
).toBeInTheDocument();

expect(
  languages.getByText("14%"),
).toBeInTheDocument();
  });

  it("uses cached resume data for a recently searched username", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: createUser(),
          repos: [],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: createUser({
            login: "google",
            avatar_url:
              "https://avatars.githubusercontent.com/u/2",
            html_url: "https://github.com/google",
            name: "Google",
            public_repos: 100,
          }),
          repos: [],
        }),
      } as Response);

    renderHome();

    submitUsername("m-amroune");

    expect(
      await screen.findByText("m-amroune"),
    ).toBeInTheDocument();

    submitUsername("google");

    expect(
      await screen.findByText("google"),
    ).toBeInTheDocument();

    submitUsername("m-amroune");

    expect(
      await screen.findByText("m-amroune"),
    ).toBeInTheDocument();

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("changes the number of repositories displayed", async () => {
    const repos = createRepos(12);

    mockSuccessfulResponse(
      createUser(),
      repos,
    );

    renderHome();

    submitUsername("m-amroune");

    await screen.findByRole("link", {
      name: "project-1",
    });

    expect(
      screen.queryByRole("link", {
        name: "project-10",
      }),
    ).not.toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("combobox"),
      {
        target: { value: "10" },
      },
    );

    expect(
      screen.getByRole("link", {
        name: "project-10",
      }),
    ).toBeInTheDocument();
  });

  it("resets repository choices for a new username while keeping the display limit", async () => {
    const firstRepos = createRepos(12);

    const googleRepos = createRepos(12, {
      owner: "google",
      prefix: "google-project",
      language: "JavaScript",
    });

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: createUser(),
          repos: firstRepos,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: createUser({
            login: "google",
            avatar_url:
              "https://avatars.githubusercontent.com/u/2",
            html_url: "https://github.com/google",
            name: "Google",
            public_repos: 100,
          }),
          repos: googleRepos,
        }),
      } as Response);

    renderHome();

    submitUsername("m-amroune");

    await screen.findByRole("link", {
      name: "project-1",
    });

    fireEvent.change(
      screen.getByRole("combobox"),
      {
        target: { value: "10" },
      },
    );

    openRepositoryPicker();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Move project-2 up",
      }),
    );

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "project-1",
      }),
    );

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "project-11",
      }),
    );

    submitUsername("google");

    await screen.findByRole("link", {
      name: "google-project-1",
    });

    expect(
      screen.getByRole("combobox"),
    ).toHaveValue("10");

    const googleRepoLinks = screen
      .getAllByRole("link")
      .filter((link) =>
        link
          .getAttribute("href")
          ?.includes(
            "github.com/google/google-project-",
          ),
      );

    expect(googleRepoLinks).toHaveLength(10);

    expect(
      googleRepoLinks.map(
        (link) => link.textContent,
      ),
    ).toEqual([
      "google-project-1",
      "google-project-2",
      "google-project-3",
      "google-project-4",
      "google-project-5",
      "google-project-6",
      "google-project-7",
      "google-project-8",
      "google-project-9",
      "google-project-10",
    ]);
  });
});