import React from "react";
import { mount } from "enzyme";
import sinon from "sinon";
import ExpandStudents from "../../../js/components/dashboard/expand-students";

describe("<ExpandStudents />", () => {
  it("should be labelled correctly on load", () => {
    const wrapper = mount(<ExpandStudents />);
    expect(wrapper.text()).toBe("Open Students");
  });

  it("should open students if all are closed", () => {
    const students = [{id: 42}];
    const expandedStudents = {42: false};
    const onClick = sinon.spy();
    const trackEvent = sinon.spy();
    const wrapper = mount(<ExpandStudents setStudentsExpanded={onClick} students={students} expandedStudents={expandedStudents} trackEvent={trackEvent} />);

    expect(wrapper.text()).toBe("Open Students");
    const button = wrapper.find("Button");
    button.simulate("click");
    expect(onClick.calledOnce).toEqual(true);
    const args = onClick.getCall(0).args;
    expect(args[0].toJS()).toEqual([42]);
    expect(args[1]).toBe(true);
    const trackEventArgs = trackEvent.getCall(0).args;
    expect(trackEventArgs[0]).toBe("Dashboard");
    expect(trackEventArgs[1]).toBe("Opened All Students");
  });

  it("should close students if any are open", () => {
    const students = [{id: 42}, {id: 43}];
    const expandedStudents = {42: true, 43: false};
    const onClick = sinon.spy();
    const trackEvent = sinon.spy();
    const wrapper = mount(<ExpandStudents setStudentsExpanded={onClick} students={students} expandedStudents={expandedStudents} trackEvent={trackEvent} />);

    expect(wrapper.text()).toBe("Close Students");
    const button = wrapper.find("Button");
    button.simulate("click");
    expect(onClick.calledOnce).toEqual(true);
    const args = onClick.getCall(0).args;
    expect(args[0].toJS()).toEqual([42, 43]);
    expect(args[1]).toBe(false);
    expect(trackEvent.calledOnce).toEqual(true);
    const trackEventArgs = trackEvent.getCall(0).args;
    expect(trackEventArgs[0]).toBe("Dashboard");
    expect(trackEventArgs[1]).toBe("Closed All Students");
  });
});
