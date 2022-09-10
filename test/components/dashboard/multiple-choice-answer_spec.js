import React from "react";
import { shallow } from "enzyme";
import MultipleChoiceAnswer, { Choice } from "../../../js/components/dashboard/multiple-choice-answer";

describe("<MultipleChoiceAnswer />", () => {
  describe("when showFullAnswer prop is false and selected answer is correct", () => {
    it("should render checkmark icon only", () => {
      const answer = { answer: [ { id: 1, choice: "choice_1" } ], correct: true };
      const question = { scored: true, choices: [ { id: 1, content: "choice_1", correct: true }, { id: 2, content: "choice_2", correct: false } ] };
      const wrapper = shallow(<MultipleChoiceAnswer showFullAnswer={false} question={question} answer={answer} />);
      expect(wrapper.find(Choice)).toHaveLength(0);
      expect(wrapper.find(".icomoon-checkmark")).toHaveLength(1);
    });
  });

  describe("when showFullAnswer prop is false and selected answer is incorrect", () => {
    it("should render cross icon only", () => {
      const answer = { answer: [ { id: 2, choice: "choice_2" } ], correct: false };
      const question = { scored: true, choices: [ { id: 1, content: "choice_1", correct: true }, { id: 2, content: "choice_2", correct: false } ] };
      const wrapper = shallow(<MultipleChoiceAnswer showFullAnswer={false} question={question} answer={answer} />);
      expect(wrapper.find(Choice)).toHaveLength(0);
      expect(wrapper.find(".icomoon-cross")).toHaveLength(1);
    });
  });

  describe("when showFullAnswer prop is false and there is no correct or incorrect answer", () => {
    describe("and correct properties are equal to `null`", () => {
      it("should render empty checkmark icon only", () => {
        const answer = { answer: [ { id: 2, choice: "choice_2" } ], correct: null };
        const question = { choices: [ { id: 1, content: "choice_1", correct: null }, { id: 2, content: "choice_2", correct: null } ] };
        const wrapper = shallow(<MultipleChoiceAnswer showFullAnswer={false} question={question} answer={answer} />);
        expect(wrapper.find(Choice)).toHaveLength(0);
        expect(wrapper.find(".icomoon-checkmark2")).toHaveLength(1);
      });
    });
    describe("and correct properties are equal to `false`", () => {
      it("should render empty checkmark icon only", () => {
        const answer = { answer: [ { id: 2, choice: "choice_2" } ], correct: false };
        const question = { choices: [ { id: 1, content: "choice_1", correct: false }, { id: 2, content: "choice_2", correct: false } ] };
        const wrapper = shallow(<MultipleChoiceAnswer showFullAnswer={false} question={question} answer={answer} />);
        expect(wrapper.find(Choice)).toHaveLength(0);
        expect(wrapper.find(".icomoon-checkmark2")).toHaveLength(1);
      });
    });
  });

  describe("when showFullAnswer prop is true", () => {
    it("should render all the choices and select one selected by student", () => {
      const answer = { selectedChoices: [ {id: 1} ] };
      const question = { choices: [ { id: 1, content: "choice_1" }, { id: 2, content: "choice_2" } ] };
      const wrapper = shallow(<MultipleChoiceAnswer showFullAnswer question={question} answer={answer} />);
      expect(wrapper.find(Choice)).toHaveLength(2);
      expect(wrapper.find(Choice).at(0).prop("choice")).toBe(question.get("choices").get(0));
      expect(wrapper.find(Choice).at(0).prop("selected")).toBe(true);
      expect(wrapper.find(Choice).at(1).prop("choice")).toBe(question.get("choices").get(1));
      expect(wrapper.find(Choice).at(1).prop("selected")).toBe(false);
    });
  });

  describe("when there is no choice with correct property equal to `true`", () => {
    it("should pass `correctAnswerDefined=false` prop to choices", () => {
      const answer = { selectedChoices: [ {id: 1} ] };
      const question = { scored: false, choices: [ { id: 1, content: "choice_1", correct: false }, { id: 2, content: "choice_2", correct: false } ] };
      const wrapper = shallow(<MultipleChoiceAnswer showFullAnswer question={question} answer={answer} />);
      expect(wrapper.find(Choice)).toHaveLength(2);
      expect(wrapper.find(Choice).at(0).prop("correctAnswerDefined")).toBe(false);
      expect(wrapper.find(Choice).at(1).prop("correctAnswerDefined")).toBe(false);
    });
  });

  describe("when there is at least one choice with correct property equal to `true`", () => {
    it("should pass `correctAnswerDefined=true` prop to choices", () => {
      const answer = { selectedChoices: [ {id: 1} ] };
      const question = { scored: true, choices: [ { id: 1, content: "choice_1", correct: true }, { id: 2, content: "choice_2", correct: false } ] };
      const wrapper = shallow(<MultipleChoiceAnswer showFullAnswer question={question} answer={answer} />);
      expect(wrapper.find(Choice)).toHaveLength(2);
      expect(wrapper.find(Choice).at(0).prop("correctAnswerDefined")).toBe(true);
      expect(wrapper.find(Choice).at(1).prop("correctAnswerDefined")).toBe(true);
    });
  });
});

describe("<Choice />", () => {
  it("should render choice text", () => {
    const choice = { id: 1, content: "choice_12345" };
    const wrapper = shallow(<Choice choice={choice} />);
    expect(wrapper.contains("choice_12345")).toBe(true);
  });

  describe("when it is not selected", () => {
    it("should render unchecked icon", () => {
      const choice = { id: 1, content: "choice_12345" };
      const wrapper = shallow(<Choice selected={false} choice={choice} />);
      expect(wrapper.find(".icomoon-radio-unchecked")).toHaveLength(1);
    });
  });

  describe("when student answer is correct", () => {
    it("should render filled checkmark icon", () => {
      const choice = { id: 1, content: "choice_12345", correct: true };
      const wrapper = shallow(<Choice selected correctAnswerDefined choice={choice} />);
      expect(wrapper.find(".icomoon-checkmark")).toHaveLength(1);
    });
  });

  describe("when student answer is incorrect", () => {
    it("should render cross icon", () => {
      const choice = { id: 1, content: "choice_12345", correct: false };
      const wrapper = shallow(<Choice selected correctAnswerDefined choice={choice} />);
      expect(wrapper.find(".icomoon-cross")).toHaveLength(1);
    });
  });

  describe("when there is no correct answer defined", () => {
    describe("and correct prop is equal to `false`", () => {
      it("should render empty checkmark icon", () => {
        const choice = { id: 1, content: "choice_12345", correct: false };
        const wrapper = shallow(<Choice selected correctAnswerDefined={false} choice={choice} />);
        expect(wrapper.find(".icomoon-checkmark2")).toHaveLength(1);
      });
    });
    describe("and correct prop is equal to `null`", () => {
      it("should render empty checkmark icon", () => {
        const choice = { id: 1, content: "choice_12345", correct: null };
        const wrapper = shallow(<Choice selected correctAnswerDefined={false} choice={choice} />);
        expect(wrapper.find(".icomoon-checkmark2")).toHaveLength(1);
      });
    });
  });
});
