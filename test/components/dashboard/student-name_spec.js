import React from "react";
import { shallow } from "enzyme";
import sinon from "sinon";
import { fromJS } from "immutable";
import StudentName from "../../../js/components/dashboard/student-name";

describe("<StudentName />", () => {
  it("should render student name", () => {
    const lastName = "Doe";
    const firstName = "John";
    const student = fromJS({ lastName, firstName });
    const wrapper = shallow(<StudentName student={student} />);
    expect(wrapper.contains(lastName)).toBe(true);
    expect(wrapper.contains(firstName)).toBe(true);
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
