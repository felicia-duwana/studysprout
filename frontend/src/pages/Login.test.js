import { validateRegistrationForm } from "./authValidation";

describe("validateRegistrationForm", () => {
  it("returns errors for missing required fields", () => {
    const errors = validateRegistrationForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        "Username is required.",
        "Email is required.",
        "Password is required.",
        "Please confirm your password."
      ])
    );
  });

  it("returns errors for invalid email and weak or mismatched passwords", () => {
    const errors = validateRegistrationForm({
      username: "Mia",
      email: "not-an-email",
      password: "12345",
      confirmPassword: "123456"
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        "Please enter a valid email address.",
        "Password must be at least 8 characters.",
        "Passwords do not match."
      ])
    );
  });

  it("returns no errors for a valid registration payload", () => {
    const errors = validateRegistrationForm({
      username: "Mia",
      email: "mia@example.com",
      password: "garden123",
      confirmPassword: "garden123"
    });

    expect(errors).toEqual([]);
  });
});
