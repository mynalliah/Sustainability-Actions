import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

// Mock the API layer (src/services/api.js)
jest.mock("../services/api", () => ({
  getActions: jest.fn(),
  createAction: jest.fn(),
  updateAction: jest.fn(),
  deleteAction: jest.fn(),
}));

import {
  getActions,
  createAction,
  updateAction,
  deleteAction,
} from "../services/api";

function typeIn(el, value) {
  // convenience helper for number/date/text
  return userEvent.clear(el).then(() => userEvent.type(el, String(value)));
}

describe("<App /> integration", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("loads and shows empty state", async () => {
    getActions.mockResolvedValueOnce([]); // initial fetch
    render(<App />);

    // Loading…
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Empty table after load
    await waitFor(() =>
      expect(screen.getByText(/no actions yet/i)).toBeInTheDocument()
    );
  });

  test("creates a new action via the form", async () => {
    getActions.mockResolvedValueOnce([]); // initial
    render(<App />);

    await screen.findByText(/no actions yet/i);

    const actionInput = screen.getByLabelText(/action/i);
    const dateInput = screen.getByLabelText(/date/i);
    const pointsInput = screen.getByLabelText(/points/i);
    const addBtn = screen.getByRole("button", { name: /add action/i });

    const created = {
      id: 1,
      action: "Recycling",
      date: "2025-01-08",
      points: 25,
    };
    createAction.mockResolvedValueOnce(created);

    await typeIn(actionInput, "Recycling");
    // NOTE: input type=date needs yyyy-mm-dd
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "2025-01-08");
    await typeIn(pointsInput, "25");
    await userEvent.click(addBtn);

    // Row appears with created content
    expect(createAction).toHaveBeenCalledWith({
      action: "Recycling",
      date: "2025-01-08",
      points: 25,
    });

    // Wait for row to show up
    await screen.findByText("Recycling");
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  test("edits and deletes a row", async () => {
    const initial = [
      { id: 1, action: "Composting", date: "2025-01-10", points: 10 },
    ];
    getActions.mockResolvedValueOnce(initial);
    render(<App />);

    // Wait for initial load
    await screen.findByText("Composting");

    // Edit points to 30
    const row = screen.getByText("Composting").closest("tr");
    const editBtn = within(row).getByRole("button", { name: /edit/i });
    await userEvent.click(editBtn);

    const pointsInput = within(row).getByDisplayValue("10"); // input now visible
    updateAction.mockResolvedValueOnce({
      id: 1,
      action: "Composting",
      date: "2025-01-10",
      points: 30,
    });

    await typeIn(pointsInput, "30");

    const saveBtn = within(row).getByRole("button", { name: /save/i });
    await userEvent.click(saveBtn);

    expect(updateAction).toHaveBeenCalledWith(1, {
      action: "Composting",
      date: "2025-01-10",
      points: 30,
    });
    await screen.findByText("30"); // updated value present

    // Delete the row
    deleteAction.mockResolvedValueOnce(true);
    const deleteBtn = within(row).getByRole("button", { name: /delete/i });
    await userEvent.click(deleteBtn);

    expect(deleteAction).toHaveBeenCalledWith(1);
    await waitFor(() =>
      expect(screen.getByText(/no actions yet/i)).toBeInTheDocument()
    );
  });
});
