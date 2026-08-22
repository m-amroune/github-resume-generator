import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import Home from "./page";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

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

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

global.fetch = mockFetch;

describe("Home", () => {
  beforeEach(() => {
      cleanup();
    mockFetch.mockReset();
  });

  it("displays loading while generating the resume", () => {
    mockFetch.mockImplementation(
      () => new Promise<Response>(() => {}),
    );

renderHome();

    fireEvent.change(
      screen.getByPlaceholderText("Enter a GitHub username..."),
      {
        target: { value: "m-amroune" },
      },
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Generate resume" }),
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
  it("displays the profile after a successful response", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        login: "m-amroune",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        html_url: "https://github.com/m-amroune",
        name: "Moustapha Amroune",
        bio: "Front-end developer",
        location: "France",
        company: null,
      },
      repos: [],
    }),
  } as Response);

renderHome();

  fireEvent.change(
    screen.getByPlaceholderText("Enter a GitHub username..."),
    {
      target: { value: "m-amroune" },
    },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Generate resume" }),
  );

  expect(await screen.findByText("m-amroune")).toBeInTheDocument();
  expect(screen.getByText("Front-end developer")).toBeInTheDocument();
});
it("displays the API error message", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({
      error: "User not found",
    }),
  } as Response);

  renderHome();

  fireEvent.change(
    screen.getByPlaceholderText("Enter a GitHub username..."),
    {
      target: { value: "unknown-user" },
    },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Generate resume" }),
  );

  expect(await screen.findByText("User not found")).toBeInTheDocument();
});
it("displays a message when there are no repositories", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        login: "m-amroune",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        html_url: "https://github.com/m-amroune",
        name: "Moustapha Amroune",
        bio: null,
        location: null,
        company: null,
      },
      repos: [],
    }),
  } as Response);

  renderHome();

  fireEvent.change(
    screen.getByPlaceholderText("Enter a GitHub username..."),
    {
      target: { value: "m-amroune" },
    },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Generate resume" }),
  );

  expect(
    await screen.findByText("No repositories to display."),
  ).toBeInTheDocument();
});

it("removes a repository from the resume when it is deselected", async () => {
  const repos = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    name: `project-${index + 1}`,
    description: "Project description",
    html_url: `https://github.com/test/project-${index + 1}`,
    stargazers_count: 7 - index,
    fork: false,
    language: "TypeScript",
    updated_at: "2026-08-05T12:00:00Z",
  }));

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        login: "m-amroune",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        html_url: "https://github.com/m-amroune",
        name: "Moustapha Amroune",
        bio: null,
        location: null,
        company: null,
      },
      repos,
    }),
  } as Response);

  renderHome();

  fireEvent.change(
    screen.getByPlaceholderText("Enter a GitHub username..."),
    {
      target: { value: "m-amroune" },
    },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Generate resume" }),
  );

  await screen.findByRole("link", { name: "project-1" });

  fireEvent.click(
    screen.getByRole("checkbox", { name: "project-1" }),
  );

  expect(
    screen.queryByRole("link", { name: "project-1" }),
  ).not.toBeInTheDocument();
});

it("adds another repository to the resume after one is deselected", async () => {
  const repos = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    name: `project-${index + 1}`,
    description: "Project description",
    html_url: `https://github.com/test/project-${index + 1}`,
    stargazers_count: 7 - index,
    fork: false,
    language: "TypeScript",
    updated_at: "2026-08-05T12:00:00Z",
  }));

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        login: "m-amroune",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        html_url: "https://github.com/m-amroune",
        name: "Moustapha Amroune",
        bio: null,
        location: null,
        company: null,
      },
      repos,
    }),
  } as Response);

  renderHome();

  fireEvent.change(
    screen.getByPlaceholderText("Enter a GitHub username..."),
    {
      target: { value: "m-amroune" },
    },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Generate resume" }),
  );

  await screen.findByRole("link", { name: "project-1" });

  fireEvent.click(
    screen.getByRole("checkbox", { name: "project-1" }),
  );

  fireEvent.click(
    screen.getByRole("checkbox", { name: "project-7" }),
  );

  expect(
    screen.queryByRole("link", { name: "project-1" }),
  ).not.toBeInTheDocument();

  expect(
    screen.getByRole("link", { name: "project-7" }),
  ).toBeInTheDocument();
});

it("prevents selecting more repositories than the current limit", async () => {
  const repos = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    name: `project-${index + 1}`,
    description: "Project description",
    html_url: `https://github.com/test/project-${index + 1}`,
    stargazers_count: 7 - index,
    fork: false,
    language: "TypeScript",
    updated_at: "2026-08-05T12:00:00Z",
  }));

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        login: "m-amroune",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        html_url: "https://github.com/m-amroune",
        name: "Moustapha Amroune",
        bio: null,
        location: null,
        company: null,
      },
      repos,
    }),
  } as Response);

  renderHome();

  fireEvent.change(
    screen.getByPlaceholderText("Enter a GitHub username..."),
    {
      target: { value: "m-amroune" },
    },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Generate resume" }),
  );

  await screen.findByRole("link", { name: "project-1" });

  expect(
    screen.getByRole("checkbox", { name: "project-7" }),
  ).toBeDisabled();
});

it("changes repository order in the resume", async () => {
  const repos = Array.from({ length: 3 }, (_, index) => ({
    id: index + 1,
    name: `project-${index + 1}`,
    description: "Project description",
    html_url: `https://github.com/test/project-${index + 1}`,
    stargazers_count: 3 - index,
    fork: false,
    language: "TypeScript",
    updated_at: "2026-08-05T12:00:00Z",
  }));

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        login: "m-amroune",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        html_url: "https://github.com/m-amroune",
        name: "Moustapha Amroune",
        bio: null,
        location: null,
        company: null,
      },
      repos,
    }),
  } as Response);

  renderHome();

  fireEvent.change(
    screen.getByPlaceholderText("Enter a GitHub username..."),
    {
      target: { value: "m-amroune" },
    },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Generate resume" }),
  );

  await screen.findByRole("link", { name: "project-1" });

  fireEvent.click(
    screen.getByRole("button", { name: "Move project-2 up" }),
  );

  const repoLinks = screen.getAllByRole("link").filter((link) =>
    link.getAttribute("href")?.includes("github.com/test/project-"),
  );

  expect(repoLinks.map((link) => link.textContent)).toEqual([
    "project-2",
    "project-1",
    "project-3",
  ]);
});

it("computes skills from displayed repositories only", async () => {
  const repos = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    name: `project-${index + 1}`,
    description: "Project description",
    html_url: `https://github.com/test/project-${index + 1}`,
    stargazers_count: 7 - index,
    fork: false,
    language: "TypeScript",
    updated_at: "2026-08-05T12:00:00Z",
  }));

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        login: "m-amroune",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        html_url: "https://github.com/m-amroune",
        name: "Moustapha Amroune",
        bio: null,
        location: null,
        company: null,
      },
      repos,
    }),
  } as Response);

  renderHome();

  fireEvent.change(
    screen.getByPlaceholderText("Enter a GitHub username..."),
    {
      target: { value: "m-amroune" },
    },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Generate resume" }),
  );

  expect(
    await screen.findByText("TypeScript (6)"),
  ).toBeInTheDocument();

  expect(
    screen.queryByText("TypeScript (7)"),
  ).not.toBeInTheDocument();
});

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        login: "m-amroune",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        html_url: "https://github.com/m-amroune",
        name: "Moustapha Amroune",
        bio: null,
        location: null,
        company: null,
      },
      repos,
    }),
  } as Response);

  renderHome();

  fireEvent.change(
    screen.getByPlaceholderText("Enter a GitHub username..."),
    {
      target: { value: "m-amroune" },
    },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Generate resume" }),
  );

  it("uses cached resume data for a recently searched username", async () => {
  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          login: "m-amroune",
          avatar_url: "https://avatars.githubusercontent.com/u/1",
          html_url: "https://github.com/m-amroune",
          name: "Moustapha Amroune",
          bio: null,
          location: null,
          company: null,
        },
        repos: [],
      }),
    } as Response)
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          login: "facebook",
          avatar_url: "https://avatars.githubusercontent.com/u/2",
          html_url: "https://github.com/facebook",
          name: "Facebook",
          bio: null,
          location: null,
          company: null,
        },
        repos: [],
      }),
    } as Response);

  renderHome();

  const input = screen.getByPlaceholderText(
    "Enter a GitHub username...",
  );

  const button = screen.getByRole("button", {
    name: "Generate resume",
  });

  fireEvent.change(input, {
    target: { value: "m-amroune" },
  });
  fireEvent.click(button);

  expect(
    await screen.findByText("m-amroune"),
  ).toBeInTheDocument();

  fireEvent.change(input, {
    target: { value: "facebook" },
  });
  fireEvent.click(button);

  expect(
    await screen.findByText("facebook"),
  ).toBeInTheDocument();

  fireEvent.change(input, {
    target: { value: "m-amroune" },
  });
  fireEvent.click(button);

  expect(
    await screen.findByText("m-amroune"),
  ).toBeInTheDocument();

  expect(mockFetch).toHaveBeenCalledTimes(2);
});

it("changes repository order in the resume", async () => {
  const repos = Array.from({ length: 3 }, (_, index) => ({
    id: index + 1,
    name: `project-${index + 1}`,
    description: "Project description",
    html_url: `https://github.com/test/project-${index + 1}`,
    stargazers_count: 3 - index,
    fork: false,
    language: "TypeScript",
    updated_at: "2026-08-05T12:00:00Z",
  }));

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        login: "m-amroune",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        html_url: "https://github.com/m-amroune",
        name: "Moustapha Amroune",
        bio: null,
        location: null,
        company: null,
      },
      repos,
    }),
  } as Response);

  renderHome();

  fireEvent.change(
    screen.getByPlaceholderText("Enter a GitHub username..."),
    {
      target: { value: "m-amroune" },
    },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Generate resume" }),
  );

  await screen.findByRole("link", { name: "project-1" });

  fireEvent.click(
    screen.getByRole("button", { name: "Move project-2 up" }),
  );

  const repoLinks = screen.getAllByRole("link").filter((link) =>
    link.getAttribute("href")?.includes("github.com/test/project-"),
  );

  expect(repoLinks.map((link) => link.textContent)).toEqual([
    "project-2",
    "project-1",
    "project-3",
  ]);
});

it("computes skills from displayed repositories only", async () => {
  const repos = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    name: `project-${index + 1}`,
    description: "Project description",
    html_url: `https://github.com/test/project-${index + 1}`,
    stargazers_count: 7 - index,
    fork: false,
    language: "TypeScript",
    updated_at: "2026-08-05T12:00:00Z",
  }));

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        login: "m-amroune",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        html_url: "https://github.com/m-amroune",
        name: "Moustapha Amroune",
        bio: null,
        location: null,
        company: null,
      },
      repos,
    }),
  } as Response);

  renderHome();

  fireEvent.change(
    screen.getByPlaceholderText("Enter a GitHub username..."),
    {
      target: { value: "m-amroune" },
    },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Generate resume" }),
  );

  expect(
    await screen.findByText("TypeScript (6)"),
  ).toBeInTheDocument();

  expect(
    screen.queryByText("TypeScript (7)"),
  ).not.toBeInTheDocument();
});

it("changes the number of repositories displayed", async () => {
  const repos = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    name: `project-${index + 1}`,
    description: "Project description",
    html_url: `https://github.com/test/project-${index + 1}`,
    stargazers_count: 12 - index,
    fork: false,
    language: "TypeScript",
    updated_at: "2026-08-05T12:00:00Z",
  }));

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        login: "m-amroune",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        html_url: "https://github.com/m-amroune",
        name: "Moustapha Amroune",
        bio: null,
        location: null,
        company: null,
      },
      repos,
    }),
  } as Response);

  renderHome();

  fireEvent.change(
    screen.getByPlaceholderText("Enter a GitHub username..."),
    {
      target: { value: "m-amroune" },
    },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Generate resume" }),
  );

 await screen.findByRole("link", { name: "project-1" });

  expect(
  screen.queryByRole("link", { name: "project-10" }),
).not.toBeInTheDocument();

  fireEvent.change(
    screen.getByLabelText("Repositories to display:"),
    {
      target: { value: "10" },
    },
  );

  expect(
  screen.getByRole("link", { name: "project-10" }),
).toBeInTheDocument();
});
})