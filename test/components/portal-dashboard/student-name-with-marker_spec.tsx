import React from "react";
import { render } from "@testing-library/react";
import { Map } from "immutable";
import { StudentNameWithMarker } from "../../../js/components/portal-dashboard/student-name-with-marker";

// Styles map to their own class names in tests.
const textWithout = (element: Element, selector: string) => {
  const copy = element.cloneNode(true) as Element;
  copy.querySelectorAll(selector).forEach(el => el.remove());
  return copy.textContent;
};
const shownText = (element: Element) => textWithout(element, ".screenReaderOnly");
const screenReaderText = (element: Element) => textWithout(element, "[aria-hidden=true]");

describe("<StudentNameWithMarker />", () => {
  it("puts the tooltip on LM for a learner mode account", () => {
    const { container, getByTitle } = render(
      <StudentNameWithMarker name="Teacher, Test (LM)" student={Map({ isTeacherPreviewStudent: true })} />);
    expect(shownText(container)).toBe("Teacher, Test (LM)");
    expect(getByTitle("Learner Mode user").textContent).toBe("LM");
  });

  it("gives screen readers the tooltip's text in place of LM", () => {
    const { container } = render(
      <StudentNameWithMarker name="Teacher, Test (LM)" student={Map({ isTeacherPreviewStudent: true })} />);
    expect(screenReaderText(container)).toBe("Teacher, Test (Learner Mode user)");
  });

  it("can put the name and the marker in separate parts, so only the name is cut off", () => {
    const { container, getByText } = render(
      <StudentNameWithMarker name="Teacher, Test (LM)" student={Map({ isTeacherPreviewStudent: true })} truncate={true} />);
    expect(shownText(container)).toBe("Teacher, Test (LM)");
    expect(getByText("Teacher, Test").className).toBe("baseName");
    expect(shownText(getByText("LM").closest(".marker") as Element)).toBe(" (LM)");
  });

  it("shows other names as they are, with no tooltip", () => {
    const cases: Array<[string, Map<any, any> | undefined]> = [
      ["Jenkins, John", Map({})],
      // Only the flag adds a tooltip, not a name that happens to end with "(LM)".
      ["Jenkins, John (LM)", Map({})],
      ["Student Response", undefined],
    ];
    cases.forEach(([name, student]) => {
      const { container, queryByTitle, unmount } = render(<StudentNameWithMarker name={name} student={student} />);
      expect(container.textContent).toBe(name);
      expect(queryByTitle("Learner Mode user")).toBeNull();
      unmount();
    });
  });
});
