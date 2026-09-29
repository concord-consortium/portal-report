import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { HeaderMenuContainer } from "../../../js/components/portal-dashboard/header-menu";

describe("<HeaderMenuContainer />", () => {
  const renderMenu = (props: Partial<React.ComponentProps<typeof HeaderMenuContainer>> = {}) =>
    render(<HeaderMenuContainer trackEvent={jest.fn()} setCompact={jest.fn()} {...props} />);

  const buttonFor = (label: HTMLElement) => label.closest("button") as HTMLButtonElement;
  const iconItemNames = (container: HTMLElement) =>
    Array.from(container.querySelectorAll("[data-cy=menu-list] > button")).map(item => item.textContent);

  it("has no Download item without a download handler", () => {
    const { container } = renderMenu();
    expect(iconItemNames(container)).toEqual(["Help"]);
  });

  it("lists the Download item above Help, with a decorative icon", () => {
    const { container, getByText } = renderMenu({ onDownloadCsv: jest.fn() });
    expect(iconItemNames(container)).toEqual(["Download as CSV", "Help"]);
    const icon = buttonFor(getByText("Download as CSV")).firstElementChild as Element;
    expect(icon.getAttribute("aria-hidden")).toBe("true");
  });

  it("calls the download handler once when the Download item is clicked", () => {
    const onDownloadCsv = jest.fn();
    const { getByText } = renderMenu({ onDownloadCsv });
    fireEvent.click(getByText("Download as CSV"));
    expect(onDownloadCsv).toHaveBeenCalledTimes(1);
  });

  it("toggles the menu with a button that reports whether it's expanded", () => {
    const { getByRole } = renderMenu();
    const toggle = getByRole("button", { name: "Menu" });
    expect(toggle.tagName).toBe("BUTTON");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps closed menu items out of the tab order and hidden from screen readers", () => {
    const { container, getByRole } = renderMenu({ onDownloadCsv: jest.fn() });
    const list = container.querySelector("[data-cy=menu-list]") as HTMLElement;
    const items = () => Array.from(list.querySelectorAll("button"));
    expect(list.getAttribute("aria-hidden")).toBe("true");
    expect(items().map(item => item.tabIndex)).toEqual([-1, -1]);

    fireEvent.click(getByRole("button", { name: "Menu" }));
    expect(list.getAttribute("aria-hidden")).toBe("false");
    expect(items().map(item => item.tabIndex)).toEqual([0, 0]);
  });

  it("returns focus to the toggle after the Download item is activated", () => {
    const { getByRole, getByText } = renderMenu({ onDownloadCsv: jest.fn() });
    const toggle = getByRole("button", { name: "Menu" });
    fireEvent.click(toggle);
    const downloadItem = buttonFor(getByText("Download as CSV"));
    downloadItem.focus();
    expect(document.activeElement).toBe(downloadItem);

    fireEvent.click(downloadItem);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(toggle);
  });

  it("closes with Escape and returns focus to the toggle", () => {
    const { getByRole, getByText } = renderMenu({ onDownloadCsv: jest.fn() });
    const toggle = getByRole("button", { name: "Menu" });
    fireEvent.click(toggle);
    const downloadItem = buttonFor(getByText("Download as CSV"));
    downloadItem.focus();

    fireEvent.keyDown(downloadItem, { key: "Escape" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(toggle);
  });
});
