// src/App.test.js
import { render, screen } from "@testing-library/react";
import App from "./App";

// mock the API module so axios is NOT pulled in during tests
jest.mock("./services/api", () => ({
  getActions: jest.fn().mockResolvedValue([]),
  createAction: jest.fn(),
  updateAction: jest.fn(),
  deleteAction: jest.fn(),
}));

test("renders header", async () => {
  render(<App />);
  expect(await screen.findByText(/Sustainability Actions/i)).toBeInTheDocument();
});
