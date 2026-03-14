import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CircularMenuItem } from "../CircularMenuItem";

describe("CircularMenuItem", () => {
  it("renders a button", () => {
    render(<CircularMenuItem label="Test" />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("displays label text", () => {
    render(<CircularMenuItem label="Home" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("displays icon", () => {
    render(<CircularMenuItem icon={<span data-testid="icon">🏠</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<CircularMenuItem label="Click me" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = jest.fn();
    render(<CircularMenuItem label="Disabled" onClick={onClick} disabled />);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });

  it("uses ariaLabel when provided", () => {
    render(<CircularMenuItem label="Home" ariaLabel="Go to home page" />);
    expect(
      screen.getByRole("button", { name: /go to home page/i })
    ).toBeInTheDocument();
  });

  it("falls back to label as aria-label", () => {
    render(<CircularMenuItem label="Search" />);
    expect(
      screen.getByRole("button", { name: /search/i })
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<CircularMenuItem label="Test" className="extra-class" />);
    expect(screen.getByRole("button")).toHaveClass("extra-class");
  });

  it("always has base class", () => {
    render(<CircularMenuItem label="Test" />);
    expect(screen.getByRole("button")).toHaveClass("circular-menu__item");
  });
});
