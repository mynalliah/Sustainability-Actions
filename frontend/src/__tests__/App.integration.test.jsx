// Integration tests for the <App /> component.
//   1) Initial load shows a "Loading…" indicator and then an empty state.
//   2) Creating a new action via the form adds a row to the table.
//   3) Editing an existing row updates the value; deleting removes the row.
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

// Each test sets up the expected return values and then verifies the UI reacts correctly.
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

/**
 * Clear an input and type a value (works for number/date/text).
 */
function typeIn(el, value) {
  return userEvent.clear(el).then(() => userEvent.type(el, String(value)));
}

/**
 * Find the <tr> that contains a given action label.
 */
function rowByActionText(actionText) {
  return screen.getByText(actionText).closest("tr");
}

describe("<App /> integration", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: loads and shows empty state
   *
   * Purpose:
   * - Render, show a Loading state, fetch data,
   *   and then render the empty-table state when the API returns [].
   *
   * Validates:
   * - Async UI states are wired correctly (Loading → "No actions yet").
   * - `getActions` result drives the table contents.
   */
  test("loads and shows empty state", async () => {
    getActions.mockResolvedValueOnce([]); // initial fetch: pretend no data exists
    render(<App />);

    // Loading… appears immediately on mount
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // After fetch resolves, the table should render the empty state
    await waitFor(() =>
      expect(screen.getByText(/no actions yet/i)).toBeInTheDocument()
    );
  });

  /**
   * Test: creates a new action via the form
   *
   * Purpose:
   * - Simulates a user filling out the "Add Action" form and submitting it.
   *
   * Validates:
   * - `createAction` is called with the exact payload.
   * - The newly created row appears in the table with correct values.
   * - Form inputs and date handling behave as expected.
   */
  test("creates a new action via the form", async () => {
    getActions.mockResolvedValueOnce([]); // start from empty state
    render(<App />);

    await screen.findByText(/no actions yet/i);

    // Grab form controls by accessible labels
    const actionInput = screen.getByLabelText(/action/i);
    const dateInput = screen.getByLabelText(/date/i);
    const pointsInput = screen.getByLabelText(/points/i);
    const addBtn = screen.getByRole("button", { name: /add action/i });

    // Mock API response for the create call (server assigns id)
    const created = {
      id: 1,
      action: "Recycling",
      date: "2025-01-08",
      points: 25,
    };
    createAction.mockResolvedValueOnce(created);

    // Fill out the form as a user would
    await typeIn(actionInput, "Recycling");
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "2025-01-08");
    await typeIn(pointsInput, "25");

    // Submit the form
    await userEvent.click(addBtn);

    // The API should be called with the exact payload (serializer-friendly)
    expect(createAction).toHaveBeenCalledWith({
      action: "Recycling",
      date: "2025-01-08",
      points: 25,
    });

    // The new row should be rendered with the correct values
    await screen.findByText("Recycling");
    const row = rowByActionText("Recycling");
    expect(within(row).getByText("25")).toBeInTheDocument();
  });

  /**
   * Test: edits and deletes a row
   *
   * Purpose:
   * - Walks through the update + delete lifecycle for an existing item.
   *
   * Validates:
   * - Inline edit toggles correctly and calls `updateAction` with the merged payload.
   * - Table re-renders the updated value (points: 10 → 30).
   * - Delete calls `deleteAction(id)` and removes the row, returning to empty state.
   */
  test("edits and deletes a row", async () => {
    // Seed with one existing action so we can edit/delete it
    const initial = [
      { id: 1, action: "Composting", date: "2025-01-10", points: 10 },
    ];
    getActions.mockResolvedValueOnce(initial);
    render(<App />);

    // Verify initial row is present
    await screen.findByText("Composting");

    // Enter edit mode for that row
    let row = rowByActionText("Composting");
    const editBtn = within(row).getByRole("button", { name: /edit/i });
    await userEvent.click(editBtn);

    // Change points from 10 → 30 and save
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

    // Ensure the API was called with the full, updated payload for that id
    expect(updateAction).toHaveBeenCalledWith(1, {
      action: "Composting",
      date: "2025-01-10",
      points: 30,
    });

    // The table should now show the updated points
    row = rowByActionText("Composting");
    await within(row).findByText("30");

    // Now delete the row and confirm we return to empty state
    deleteAction.mockResolvedValueOnce(true);
    const deleteBtn = within(row).getByRole("button", { name: /delete/i });
    await userEvent.click(deleteBtn);

    expect(deleteAction).toHaveBeenCalledWith(1);

    await waitFor(() =>
      expect(screen.getByText(/no actions yet/i)).toBeInTheDocument()
    );
  });
});