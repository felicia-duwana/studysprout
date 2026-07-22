const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegistrationForm({ username, email, password, confirmPassword }) {
  const errors = [];

  if (!username || !username.trim()) {
    errors.push("Username is required.");
  }

  if (!email || !email.trim()) {
    errors.push("Email is required.");
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push("Please enter a valid email address.");
  }

  if (!password) {
    errors.push("Password is required.");
  } else if (password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }

  if (!confirmPassword || !confirmPassword.trim()) {
    errors.push("Please confirm your password.");
  } else if (password && password !== confirmPassword) {
    errors.push("Passwords do not match.");
  }

  return errors;
}
