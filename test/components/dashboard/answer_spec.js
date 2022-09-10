import React from "react";
import AnswerContainer, { Answer, NoAnswer, GenericAnswer } from "../../../js/containers/dashboard/answer";
import { mountWithStore } from "../../setupTest";
import OpenResponseAnswer from "../../../js/components/dashboard/open-response-answer";
import MultipleChoiceAnswer from "../../../js/components/dashboard/multiple-choice-answer";
import { shallow } from "enzyme";

describe("<AnswerContainer />", () => {
  it("should fetch correct Answer from store", () => {
    const question = { id: "q1" };
    const student = { id: "s1" };
    const state = {
      report: {
        answers: {
          a1: {
            questionId: "q1",
            questionType: "open_response",
            answer: "correct answer",
            platformUserId: "s1"
          },
          a2: {
            questionId: "q1",
            questionType: "open_response",
            answer: "incorrect answer",
            platformUserId: "s2"
          }
        },
        questions: {
          q1: question
        },
        students: {
          "s1": student
        }
      }
    };
    const wrapper = mountWithStore(
      <AnswerContainer question={question} student={student} showFullAnswer={true} />,
      state
    );

    expect(wrapper.find(AnswerContainer)).toHaveLength(1);
    expect(wrapper.find(Answer)).toHaveLength(1);
    expect(wrapper.find(OpenResponseAnswer)).toHaveLength(1);

    expect(wrapper.text()).toEqual(expect.stringContaining("correct answer"));
    expect(wrapper.text()).not.toEqual(expect.stringContaining("incorrect answer"));
  });
});

describe("<Answer />", () => {
  it("should render <NoAnswer> when answer is not submitted", () => {
    const answer = { submitted: false };
    const question = { required: true };
    const wrapper = shallow(<Answer answer={answer} question={question} />);
    expect(wrapper.find(NoAnswer)).toHaveLength(1);
  });

  it("should render <GenericAnswer> when answer type is unknown", () => {
    const answer = { questionType: "UnknownType_123" };
    const wrapper = shallow(<Answer answer={answer} />);
    expect(wrapper.find(GenericAnswer)).toHaveLength(1);
  });

  it("should render <NoAnswer> when prop is not provided", () => {
    const answer = null;
    const wrapper = shallow(<Answer answer={answer} />);
    expect(wrapper.find(NoAnswer)).toHaveLength(1);
  });

  it('should render <OpenResponse> when answer type is "open_response"', () => {
    const answer = { questionType: "open_response" };
    const wrapper = shallow(<Answer answer={answer} />);
    expect(wrapper.find(OpenResponseAnswer)).toHaveLength(1);
  });

  it('should render <MultipleChoiceAnswer> when answer type is "multiple_choice"', () => {
    const answer = { questionType: "multiple_choice" };
    const wrapper = shallow(<Answer answer={answer} />);
    expect(wrapper.find(MultipleChoiceAnswer)).toHaveLength(1);
  });
});
