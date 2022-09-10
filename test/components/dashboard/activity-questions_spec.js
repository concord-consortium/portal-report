import React from "react";
import { shallow, mount } from "enzyme";
import ActivityQuestions from "../../../js/components/dashboard/activity-questions";

describe("<ActivityQuestions />", () => {
  const prompt1 = "1st question prompt";
  const prompt2 = "2nd question prompt (not visible)";
  const activity = { questions: [
    { id: 1, visible: true, prompt: prompt1, questionNumber: "1", type: "multiple_choice" },
    { id: 2, visible: false, prompt: prompt2, questionNumber: "2", type: "multiple_choice" }
  ]};
  const expandedQuestions = {};
  describe("when activity is expanded", () => {
    describe("when questions are not expanded", () => {
      it("should render prompts of the visible questions", () => {
        const wrapper = shallow(
          <ActivityQuestions
            expanded
            activity={activity}
            expandedQuestions={expandedQuestions}
          />);
        expect(wrapper.html()).toEqual(expect.stringContaining("Q1."));
        expect(wrapper.contains("Q2.")).toBe(false);
        expect(wrapper.contains(prompt1)).toBe(false);
      });
    });
    describe("when first question is expanded", () => {
      it("should render prompts of the visible questions", () => {
        const expandedQuestions = {1: true};
        const wrapper = shallow(
          <ActivityQuestions
            expanded
            activity={activity}
            expandedQuestions={expandedQuestions}
          />);
        expect(wrapper.text()).toEqual(expect.stringContaining("Q1."));
        expect(wrapper.text()).toEqual(expect.stringContaining(prompt1));
      });

      it("should render a clickable expansion box", () => {
        const expandedQuestions = {1: true};
        let clickCount = 0;
        const onClick = () => clickCount++;
        const wrapper = mount(
          <ActivityQuestions
            expanded
            activity={activity}
            expandedQuestions={expandedQuestions}
            selectQuestion={onClick}
            trackEvent={onClick}
          />);
        const opener = wrapper.find('[data-cy="expand-question-details"]');
        expect(clickCount).toBe(0);
        opener.simulate("click");
        expect(clickCount).toBe(2);
      });
    });
  });
});
