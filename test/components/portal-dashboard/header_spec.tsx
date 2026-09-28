import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Header } from "../../../js/components/portal-dashboard/header";

// Images and styles both map to identity-obj-proxy, which can't be converted to a string for the logo's src.
// This proxy can, and still returns each class name as itself. Jest applies it to the styles too, since
// both resolve to the same module.
jest.mock("../../../img/cc-logo.png", () => new Proxy({}, {
  get: (target, key) => key === Symbol.toPrimitive ? () => "cc-logo.png" : key === "__esModule" ? false : key
}));

describe("<Header />", () => {
  const renderHeader = (props: Partial<React.ComponentProps<typeof Header>> = {}) =>
    render(
      <Header
        userName="Kristen Teachername"
        assignmentName="Report Test Sequence"
        trackEvent={jest.fn()}
        setDashboardViewMode={jest.fn()}
        viewMode="ProgressDashboard"
        colorTheme="progress"
        isResearcher={false}
        clazzName="Test Class"
        setStudentSort={jest.fn()}
        sortByMethod="NAME"
        {...props}
      />
    );

  it("shows a Download as CSV button that calls the download handler", () => {
    const onDownloadCsv = jest.fn();
    const { getByRole } = renderHeader({ onDownloadCsv });
    const button = getByRole("button", { name: "Download as CSV" });
    fireEvent.click(button);
    expect(onDownloadCsv).toHaveBeenCalledTimes(1);
  });

  it("hides the button's icon from screen readers", () => {
    const { getByRole } = renderHeader({ onDownloadCsv: jest.fn() });
    const icon = getByRole("button", { name: "Download as CSV" }).firstElementChild as Element;
    expect(icon.getAttribute("aria-hidden")).toBe("true");
  });

  it("has no download button or menu item without a download handler", () => {
    const { queryByText } = renderHeader();
    expect(queryByText("Download as CSV")).toBeNull();
  });

  describe("when the button fits next to the teacher's name", () => {
    let rectSpy: jest.SpyInstance;
    beforeEach(() => {
      const rects: Record<string, Partial<DOMRect>> = {
        assignment: { left: 400, right: 700, width: 300 },
        button: { left: 800, right: 990, width: 190 },
        owner: { left: 1000, right: 1200, width: 200 },
      };
      rectSpy = jest.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function(this: Element) {
        const cy = this.getAttribute("data-cy");
        const key = cy === "download-csv-button" ? "button"
          : cy === "account-owner" ? "owner"
          : this.firstElementChild?.getAttribute("data-cy") === "choose-assignment" ? "assignment"
          : undefined;
        return { left: 0, right: 0, width: 0, ...(key ? rects[key] : {}) } as DOMRect;
      });
    });
    afterEach(() => rectSpy.mockRestore());

    it("shows the button as a shortcut and keeps the Download item in the menu", () => {
      const { container, getByRole } = renderHeader({ onDownloadCsv: jest.fn() });
      expect(getByRole("button", { name: "Download as CSV" }).className).not.toContain("downloadButtonHidden");
      expect(container.querySelector("[data-cy=download-csv-menu-item]")).not.toBeNull();
    });
  });

  describe("when the button doesn't fit", () => {
    // jsdom doesn't lay out the page, so every element measures 0 wide and the button can't fit.
    it("hides the button, leaving Download in the menu", () => {
      const { container } = renderHeader({ onDownloadCsv: jest.fn() });
      const button = container.querySelector("[data-cy=download-csv-button]") as HTMLElement;
      expect(button.className).toContain("downloadButtonHidden");
      expect(container.querySelector("[data-cy=download-csv-menu-item]")).not.toBeNull();
    });
  });
});
