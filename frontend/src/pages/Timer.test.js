import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Timer from "./Timer";

jest.mock("../api", () => ({
  apiPath: (path) => path,
}));

jest.mock("../hooks/useSessions", () => () => ({
  sessions: [],
  fetchSessions: jest.fn(),
}));

describe("Timer", () => {
  beforeEach(() => {
    localStorage.setItem("token", "test-token");

    global.fetch = jest.fn((url) => {
      if (url.includes("/api/v1/sessions/flower")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            flower: {
              species: "Sunflower",
              rarity: "Common",
            },
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ sessions: [] }),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("disables the duration controls while a session is running", async () => {
    render(<Timer onLogout={jest.fn()} />);

    const durationInput = screen.getByRole("spinbutton");
    const setTimerButton = screen.getByRole("button", { name: /set timer/i });

    expect(durationInput).not.toBeDisabled();
    expect(setTimerButton).not.toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: /^start$/i }));

    await waitFor(() => {
      expect(durationInput).toBeDisabled();
      expect(setTimerButton).toBeDisabled();
    });
  });
});
