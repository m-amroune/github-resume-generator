import { fireEvent, render, screen } from "@testing-library/react";
import SearchForm from "./SearchForm";

describe("SearchForm", () => {
  it("displays the input and submit button", () => {
    render(<SearchForm onSubmit={jest.fn()} disabled={false} />);

    expect(
      screen.getByPlaceholderText("Enter a GitHub username..."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Generate resume" }),
    ).toBeInTheDocument();
  });
it("submits a valid username", () => {
  const handleSubmit = jest.fn();

  render(<SearchForm onSubmit={handleSubmit} disabled={false} />);

  fireEvent.change(
    screen.getByPlaceholderText("Enter a GitHub username..."),
    {
      target: { value: "m-amroune" },
    },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Generate resume" }),
  );

  expect(handleSubmit).toHaveBeenCalledWith("m-amroune");
});
it("displays an error for an invalid username", () => {
  const handleSubmit = jest.fn();

  render(<SearchForm onSubmit={handleSubmit} disabled={false} />);

  fireEvent.change(
    screen.getByPlaceholderText("Enter a GitHub username..."),
    {
      target: { value: "invalid_username" },
    },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Generate resume" }),
  );

  expect(screen.getByText("Invalid username")).toBeInTheDocument();
  expect(handleSubmit).not.toHaveBeenCalled();
});
it("disables the submit button", () => {
  render(<SearchForm onSubmit={jest.fn()} disabled={true} />);

  expect(
    screen.getByRole("button", { name: "Generate resume" }),
  ).toBeDisabled();
});
});