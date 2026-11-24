import React from "react";
import { shallow } from "enzyme";
import { render } from "@testing-library/react";
import sinon from "sinon";
import { fromJS } from "immutable";
import StudentName from "../../../js/components/dashboard/student-name";
import { shownText } from "../../student-name-test-helpers";

describe("<StudentName />", () => {
  it("should render student name", () => {
    const { container } = render(<StudentName student={fromJS({ lastName: "Doe", firstName: "John" })} />);
    expect(shownText(container)).toBe("Doe, John");
  });

  it("marks a teacher's learner mode account with (LM), with a tooltip on LM", () => {
    const student = fromJS({ lastName: "Teacher", firstName: "Test", isTeacherPreviewStudent: true });
    const { container, getByTitle, getByText } = render(<StudentName student={student} />);
    expect(shownText(container)).toBe("Teacher, Test (LM)");
    expect(getByTitle("Learner Mode user").textContent).toBe("LM");
    // The column cuts off long names. Only the `baseName` part may shrink, so "(LM)" stays visible.
    expect(getByText("Teacher, Test").className).toBe("baseName");
  });

  it("should call setStudentExpanded when user clicks on it", () => {
    const onClick = sinon.spy();
    const trackEvent = sinon.spy();
    const wrapper = shallow(<StudentName expanded={false} setStudentExpanded={onClick} trackEvent={trackEvent} />);
    wrapper.simulate("click");
    expect(onClick.calledOnce).toBe(true);
    expect(trackEvent.calledOnce).toBe(true);
  });
});
