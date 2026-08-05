import { isValidUsername } from "./isValidUsername";

describe("isValidUsername", () => {
  it("accepts a valid username", () => {
    expect(isValidUsername("m-amroune")).toBe(true);
  });
  it("rejects an empty username", () => {
  expect(isValidUsername("")).toBe(false);
});
it("rejects invalid characters", () => {
  expect(isValidUsername("m_amroune")).toBe(false);
  expect(isValidUsername("m amroune")).toBe(false);
  expect(isValidUsername("m@amroune")).toBe(false);
});
it("rejects invalid format or length", () => {
  expect(isValidUsername("-username")).toBe(false);
  expect(isValidUsername("username-")).toBe(false);
  expect(isValidUsername("user--name")).toBe(false);
  expect(isValidUsername("a".repeat(40))).toBe(false);
});
});