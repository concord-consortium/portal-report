import React from "react";
import { shallow } from "enzyme";
import sinon from "sinon";
import { fromJS } from "immutable";
import ActivityName from "../../../js/components/dashboard/activity-name";

describe("<ActivityName />", () => {
  it("should render activity name", () => {
    const name = "Test activity";
    const activity = fromJS({ name });
    const wrapper = shallow(<ActivityName activity={activity} number={1} />);
    expect(wrapper.text()).toEqual(expect.stringContaining(name));
    expect(wrapper.text()).toEqual(expect.stringContaining("Act 1"));
    expect(wrapper.text()).not.toEqual(expect.stringContaining("Act 2"));
  });
  it("should call setActivityExpanded when user clicks on it", () => {
    const onClick = sinon.spy();
    const wrapper = shallow(<ActivityName setActivityExpanded={onClick} trackEvent={onClick} />);
    wrapper.simulate("click");
    expect(onClick.firstCall.calledWith()).toBe(true);
  });
});
