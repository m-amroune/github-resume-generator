import { fireEvent, render, screen } from "@testing-library/react";
import Home from "./page";

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

global.fetch = mockFetch;

describe("Home", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("displays loading while generating the resume", () => {
    mockFetch.mockImplementation(
      () => new Promise<Response>(() => {}),
    );

    render(<Home />);

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

  render(<Home />);

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

  render(<Home />);

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

  render(<Home />);

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
});