import React from "react";
import { mount } from "enzyme";
import { fromJS } from "immutable";
import Dashboard from "../../../js/components/dashboard/dashboard";
import StudentName from "../../../js/components/dashboard/student-name";
import ActivityName from "../../../js/components/dashboard/activity-name";
import ActivityQuestions from "../../../js/components/dashboard/activity-questions";
import ActivityAnswers from "../../../js/components/dashboard/activity-answers";
import { Modal } from "react-bootstrap";

describe("<Dashboard />", () => {
  it("should render student names", () => {
    const students = fromJS([ { id: 1 }, { id: 2 }, { id: 3 } ]);
    const wrapper = mount(<Dashboard students={students} />);
    expect(wrapper.find(StudentName)).toHaveLength(3);
  });

  it("should render visible activity names", () => {
    const activities = fromJS({ 1: { id: 1, visible: true }, 2: { id: 2, visible: true }, 3: { id: 3, visible: false } });
    const wrapper = mount(<Dashboard activities={activities} />);
    expect(wrapper.find(ActivityName)).toHaveLength(2);
  });

  it("should render visible activity questions", () => {
    const activities = fromJS({ 1: { id: 1, visible: true }, 2: { id: 2, visible: true }, 3: { id: 3, visible: false } });
    const wrapper = mount(<Dashboard activities={activities} />);
    expect(wrapper.find(ActivityQuestions)).toHaveLength(2);
  });

  it("should render visible activity answers", () => {
    const activities = fromJS({ 1: { id: 1, visible: true }, 2: { id: 2, visible: true }, 3: { id: 3, visible: false } });
    const students = fromJS([ { id: 1 } ]);
    const wrapper1 = mount(<Dashboard students={students} activities={activities} />);
    expect(wrapper1.find(ActivityAnswers)).toHaveLength(2);

    const multipleStudents = fromJS([ { id: 1 }, { id: 2 } ]);
    const wrapper2 = mount(<Dashboard students={multipleStudents} activities={activities} />);
    // ActivityAnswer components are displayed in a table, so their number is activities_count * students_count.
    expect(wrapper2.find(ActivityAnswers)).toHaveLength(2 * multipleStudents.size);
  });

  it("synchronizes width of activity name, question prompts and activity answers", () => {
    const students = fromJS([ { id: 1 } ]);
    const activities = fromJS({ 1: { id: 1, visible: true, questions: [ { id: 1, visible: true, type: "Embeddable:MultipleChoice" }, { id: 2, visible: true, type: "Embeddable:MultipleChoice" } ] }, 2: { id: 3, visible: true, type: "Embeddable:MultipleChoice" } });
    const expandedActivities = fromJS({ 1: true }); // expand the first activity
    const wrapper = mount(<Dashboard students={students} activities={activities} expandedActivities={expandedActivities} />);

    const activityWidth = wrapper.find(ActivityName).first().prop("width");
    const questionPromptsWidth = wrapper.find(ActivityQuestions).first().prop("width");
    const activityAnswersWidth = wrapper.find(ActivityAnswers).first().prop("width");

    expect(typeof activityWidth).toBe("string");
    expect(parseInt(activityWidth, 10)).toBeGreaterThan(0); // parseInt will ignore 'px' suffix
    expect(activityWidth).toBe(questionPromptsWidth);
    expect(questionPromptsWidth).toBe(activityAnswersWidth);
  });

  it("includes only visible questions for column width calculations", () => {
    const students = fromJS([ { id: 1 } ]);
    // This setup includes two expanded activities. One has more questions, but they both have the same number of
    // visible questions, so widths should be equal.
    const activities = fromJS({
      1: { id: 1, visible: true, questions: [ { id: 1, visible: true, type: "Embeddable:MultipleChoice" }, { id: 2, visible: true, type: "Embeddable:MultipleChoice" } ] },
      2: { id: 2, visible: true, questions: [ { id: 1, visible: true, type: "Embeddable:MultipleChoice" }, { id: 2, visible: true, type: "Embeddable:MultipleChoice" }, { id: 3, visible: false, type: "Embeddable:MultipleChoice" } ] }
    });
    const expandedActivities = fromJS({ 1: true, 2: true });
    const wrapper = mount(<Dashboard students={students} activities={activities} expandedActivities={expandedActivities} />);

    const firstActivityWidth = wrapper.find(ActivityName).at(0).prop("width");
    const secondActivityWidth = wrapper.find(ActivityName).at(1).prop("width");

    expect(typeof firstActivityWidth).toBe("string");
    expect(parseInt(firstActivityWidth, 10)).toBeGreaterThan(0); // parseInt will ignore 'px' suffix
    expect(firstActivityWidth).toBe(secondActivityWidth);
  });

  describe("the question details modal box", () => {
    const students = fromJS([ { id: 1 } ]);
    const activities = fromJS({
      1: { id: 1, visible: true, questions: [ { id: 1, visible: true, type: "Embeddable:MultipleChoice" }, { id: 2, visible: true, type: "Embeddable:MultipleChoice" } ] }
    });
    const expandedActivities = fromJS({ 1: true });

    describe("when no question is selected", () => {
      it("the question modal is not visible", () => {
        const selectedQuestion = null;
        const wrapper = mount(
          <Dashboard
            students={students}
            activities={activities}
            selectedQuestion={selectedQuestion}
            expandedActivities={expandedActivities} />
        );
        expect(wrapper.find(Modal).props().show).toBe(false);
      });
    });

    describe("when a question is selected", () => {
      it("the question modal is visible", () => {
        const selectedQuestion = fromJS({
          id: 1,
          prompt: "why is the sky blue",
          answers: []
        });
        const wrapper = mount(
          <Dashboard
            students={students}
            activities={activities}
            selectedQuestion={selectedQuestion}
            expandedActivities={expandedActivities} />
        );
        expect(wrapper.find(Modal).props().show).toBe(true);
      });
    });
  });
});
