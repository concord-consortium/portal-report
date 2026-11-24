import React from "react";
import { render } from "@testing-library/react";
import { fromJS } from "immutable";
import { StudentNames } from "../../../js/components/portal-dashboard/student-names";
import { shownText } from "../../student-name-test-helpers";

describe("<StudentNames />", () => {
  const students = fromJS([
    { id: "1", firstName: "John", lastName: "Jenkins", name: "Student 1" },
    { id: "2", firstName: "Test", lastName: "Teacher", name: "Student 2 (LM)", isTeacherPreviewStudent: true },
  ]);
  const renderStudentNames = (isAnonymous: boolean) =>
    render(
      <StudentNames
        students={students}
        isAnonymous={isAnonymous}
        isCompact={false}
        setCurrentStudent={jest.fn()}
        setDashboardViewMode={jest.fn()}
        setListViewMode={jest.fn()}
        trackEvent={jest.fn()}
      />
    );
  const shownNames = (container: HTMLElement) =>
    Array.from(container.querySelectorAll("[data-cy=student-name]")).map(shownText);

  it("marks a teacher's learner mode account with (LM), with a tooltip on LM only", () => {
    const { container, getAllByTitle, getByText } = renderStudentNames(false);
    expect(shownNames(container)).toEqual(["Jenkins, John", "Teacher, Test (LM)"]);
    const tooltips = getAllByTitle("Learner Mode user");
    expect(tooltips.map(el => [el.tagName, el.textContent])).toEqual([["ABBR", "LM"]]);
    // The list cuts off long names. Only the `baseName` part may shrink, so "(LM)" stays visible.
    expect(getByText("Teacher, Test").className).toBe("baseName");
  });

  it("keeps the marker and tooltip when names are anonymized", () => {
    const { container, getAllByTitle } = renderStudentNames(true);
    expect(shownNames(container)).toEqual(["Student 1", "Student 2 (LM)"]);
    expect(getAllByTitle("Learner Mode user").map(el => el.textContent)).toEqual(["LM"]);
  });
});
