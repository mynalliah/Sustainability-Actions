// Integration tests for the <App /> component.
//   1) Initial load shows a "Loading…" indicator and then an empty state.
//   2) Creating a new action via the form adds a row to the table.
//   3) Editing an existing row updates the value; deleting removes the row.
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

// Mock the API layer
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

// convenience helper for number/date/text
function typeIn(el, value) {
  return userEvent.clear(el).then(() => userEvent.type(el, String(value)));
}

// find the <tr> that contains a given action label
function rowByActionText(actionText) {
  return screen.getByText(actionText).closest("tr");
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
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "2025-01-08");
    await typeIn(pointsInput, "25");
    await userEvent.click(addBtn);

    expect(createAction).toHaveBeenCalledWith({
      action: "Recycling",
      date: "2025-01-08",
      points: 25,
    });

    // Assert within the created row 
    await screen.findByText("Recycling");
    const row = rowByActionText("Recycling");
    expect(within(row).getByText("25")).toBeInTheDocument();
  });

  test("edits and deletes a row", async () => {
    const initial = [
      { id: 1, action: "Composting", date: "2025-01-10", points: 10 },
    ];
    getActions.mockResolvedValueOnce(initial);
    render(<App />);

    await screen.findByText("Composting");

    let row = rowByActionText("Composting");
    const editBtn = within(row).getByRole("button", { name: /edit/i });
    await userEvent.click(editBtn);

    const pointsInput = within(row).getByDisplayValue("10"); 
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

    row = rowByActionText("Composting");
    await within(row).findByText("30"); 

    deleteAction.mockResolvedValueOnce(true);
    const deleteBtn = within(row).getByRole("button", { name: /delete/i });
    await userEvent.click(deleteBtn);

    expect(deleteAction).toHaveBeenCalledWith(1);
    await waitFor(() =>
      expect(screen.getByText(/no actions yet/i)).toBeInTheDocument()
    );
  });
});
