import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SectionHeader from "../SectionHeader";
import React from "react";

vi.mock("@/i18n/routing", () => ({
  Link: ({ prefetch, ...props }: any) => <a {...props} />,
}));

// Mock the CanvasTextImage component since we just want to test the SectionHeader composition
vi.mock("../TextImageCanvas", () => ({
  CanvasTextImage: ({ text, className }: { text: string; className?: string }) => (
    <div data-testid="mock-canvas" className={className}>
      {text}
    </div>
  ),
}));

describe("SectionHeader Component", () => {
  it("should render the heading, title, and action link", () => {
    render(
      <SectionHeader
        headingId="test-heading"
        headingText="Test Heading"
        title="Featured Items"
        actionText="See All"
        viewAllHref="/featured"
      />
    );

    // Should render the sr-only heading
    const heading = screen.getByText("Test Heading");
    expect(heading).toHaveClass("sr-only");
    expect(heading).toHaveAttribute("id", "test-heading");

    // Should render the mock CanvasTextImage
    const title = screen.getByTestId("mock-canvas");
    expect(title).toHaveTextContent("Featured Items");

    // Should render the action link
    const link = screen.getByRole("link", { name: /view all test heading/i });
    expect(link).toHaveAttribute("href", "/featured");
    expect(screen.getByText("See All")).toBeInTheDocument();
  });

  it("should use default action text and href if not provided", () => {
    render(
      <SectionHeader
        headingId="test-heading"
        headingText="Test Heading"
        title="Featured Items"
      />
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/product"); // default is /product
    expect(screen.getByText("View All")).toBeInTheDocument(); // default is View All
  });

  it("should accept custom container and title class names", () => {
    const { container } = render(
      <SectionHeader
        headingId="test-heading"
        headingText="Test Heading"
        title="Featured Items"
        containerClassName="custom-container"
        titleClassName="custom-title"
      />
    );

    // container should have the class
    expect(container.firstChild).toHaveClass("custom-container");

    // title should have the class
    const title = screen.getByTestId("mock-canvas");
    expect(title).toHaveClass("custom-title");
  });
});
