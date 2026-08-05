import { getDaysAgo } from "./getDaysAgo";

describe("getDaysAgo", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns "Updated today" for today', () => {
    jest
      .spyOn(Date, "now")
      .mockReturnValue(new Date("2026-08-05T12:00:00Z").getTime());

    expect(getDaysAgo("2026-08-05T08:00:00Z")).toBe("Updated today");
  });

  it('returns "Updated 1 day ago" for yesterday', () => {
  jest
    .spyOn(Date, "now")
    .mockReturnValue(new Date("2026-08-05T12:00:00Z").getTime());

  expect(getDaysAgo("2026-08-04T12:00:00Z")).toBe("Updated 1 day ago");
});

it('returns the number of days for an older update', () => {
  jest
    .spyOn(Date, "now")
    .mockReturnValue(new Date("2026-08-05T12:00:00Z").getTime());

  expect(getDaysAgo("2026-07-31T12:00:00Z")).toBe("Updated 5 days ago");
});
});