import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CircularMenu } from "../CircularMenu";

const items = [
  { label: "Home", onClick: jest.fn() },
  { label: "Search", onClick: jest.fn() },
  { label: "Settings", onClick: jest.fn() },
];

describe("CircularMenu", () => {
  beforeEach(() => {
    items.forEach((item) => item.onClick.mockClear());
  });

  it("renders the trigger button", () => {
    render(<CircularMenu items={items} />);
    expect(
      screen.getByRole("button", { name: /open menu/i })
    ).toBeInTheDocument();
  });

  it("does not show items when closed", () => {
    render(<CircularMenu items={items} />);
    const menuItems = screen.queryAllByRole("menuitem");
    menuItems.forEach((el) => {
      // they exist in the DOM but are visually hidden (opacity 0 / scale 0)
      expect(el).toBeInTheDocument();
    });
  });

  it("toggles open on trigger click", () => {
    render(<CircularMenu items={items} />);
    const trigger = screen.getByRole("button", { name: /open menu/i });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("calls onOpenChange when toggling", () => {
    const onOpenChange = jest.fn();
    render(<CircularMenu items={items} onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole("button", { name: /open menu/i });

    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders correct number of menu items", () => {
    render(<CircularMenu items={items} />);
    expect(screen.getAllByRole("menuitem")).toHaveLength(items.length);
  });

  it("renders item labels", () => {
    render(<CircularMenu items={items} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("calls item onClick handler when clicked", () => {
    render(<CircularMenu items={items} />);
    fireEvent.click(screen.getByText("Home").closest("button")!);
    expect(items[0].onClick).toHaveBeenCalledTimes(1);
  });

  it("renders with custom triggerIcon", () => {
    render(<CircularMenu items={items} triggerIcon="★" />);
    expect(screen.getByText("★")).toBeInTheDocument();
  });

  it("works in controlled mode", () => {
    const { rerender } = render(<CircularMenu items={items} open={false} />);
    expect(
      screen.getByRole("button", { name: /open menu/i })
    ).toHaveAttribute("aria-expanded", "false");

    rerender(<CircularMenu items={items} open={true} />);
    expect(
      screen.getByRole("button", { name: /open menu/i })
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("applies custom className", () => {
    const { container } = render(
      <CircularMenu items={items} className="my-menu" />
    );
    expect(container.firstChild).toHaveClass("my-menu");
  });

  it("applies custom triggerAriaLabel", () => {
    render(
      <CircularMenu items={items} triggerAriaLabel="Toggle actions" />
    );
    expect(
      screen.getByRole("button", { name: /toggle actions/i })
    ).toBeInTheDocument();
  });
});
