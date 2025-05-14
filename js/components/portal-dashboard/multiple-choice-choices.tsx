import React from "react";
import { Map, List } from "immutable";
import Choice from "./choice";

interface IProps {
  answers?: Map<string, any>;
  choices?: List<Map<string, any>>;
  inQuestionDetailsPanel?: boolean;
  question: Map<string, any>;
  showStats?: boolean;
  studentAnswer?: Map<any, any>;
  students?: Map<any, any>;
}

function buildClassChoiceData(
  choices: List<Map<string, any>>,
  answers: Map<string, any>,
  students: Map<any, any>,
  inQuestionDetailsPanel?: boolean
) {
  let answerCount = 0;
  let choiceData = choices.map((choice: any) => {
    if (!choice) return Map();
    const choiceId = choice.get("id");
    const count = answers.reduce((acc: number, answer: any) => {
      if (!answer) return acc;
      const choiceIds = answer.getIn(["answer", "choiceIds"]);
      return choiceIds && choiceIds.includes(choiceId) ? acc + 1 : acc;
    }, 0);
    answerCount += count;
    return Map({
      choice,
      count,
      percentage: Math.round((count / students.size) * 1000) / 10,
      selected: count > 0
    });
  }).toArray();

  if (inQuestionDetailsPanel) {
    // Add a "No response" item
    const noResponseCount = students.size - answerCount;
    choiceData = [...choiceData, Map({
      choice: Map({ id: "noResponse", content: "No response" }),
      count: noResponseCount,
      percentage: Math.round((noResponseCount / students.size) * 1000) / 10,
      selected: noResponseCount > 0
    })];
  }
  return choiceData;
}

function buildStudentChoiceData(
  choices: List<Map<string, any>>,
  studentAnswer: Map<any, any>,
  inQuestionDetailsPanel?: boolean
) {
  const selectedIds = studentAnswer.get("selectedChoices")?.map((c: any) => c.get("id")) || List();
  const hasResponse = selectedIds.size > 0;
  let choiceData = choices.map((choice: any) => {
    if (!choice) return Map();
    const selected = selectedIds.includes(choice.get("id"));
    return Map({
      choice,
      selected
    });
  }).toArray();

  if (inQuestionDetailsPanel) {
    // Add a 'No response' item
    choiceData = [
      ...choiceData,
      Map({
        choice: Map({ id: "noResponse", content: "No response" }),
        selected: !hasResponse,
        noResponseFilled: !hasResponse
      })
    ];
  }
  return choiceData;
}

function buildChoiceData(
  choices: List<Map<string, any>>,
  answers?: Map<string, any>,
  students?: Map<any, any>,
  studentAnswer?: Map<any, any>,
  inQuestionDetailsPanel?: boolean
) {
  if (answers && students) {
    return buildClassChoiceData(choices, answers, students, inQuestionDetailsPanel);
  } else if (studentAnswer) {
    return buildStudentChoiceData(choices, studentAnswer, inQuestionDetailsPanel);
  }
  return [];
}

const MultipleChoiceChoices: React.FC<IProps> = (props) => {
  const {answers, choices: _choices, inQuestionDetailsPanel, question, showStats = false, studentAnswer, students } = props;
  const choices = List(_choices || question.get("choices") || []) as List<Map<string, any>>;
  const choiceData = buildChoiceData(choices, answers, students, studentAnswer, inQuestionDetailsPanel);
  const multipleAnswer = question?.get("authoredState")?.get("multipleAnswers");
  const correctAnswerDefined = question.get("scored");

  return (
    <div data-cy="multiple-choice-answers">
      {choices.size > 0 ? choiceData.map((data: any) => {
        const choice = data.get("choice");
        return (
          <Choice
            key={choice.get("id")}
            choice={choice}
            correctAnswerDefined={correctAnswerDefined}
            count={data.get("count")}
            multipleAnswer={multipleAnswer}
            percentage={data.get("percentage")}
            selected={data.get("selected")}
            showStats={showStats}
          />
        );
      }) : "Question doesn't have any choices"}
    </div>
  );
};

export default MultipleChoiceChoices;
