import React from "react";
import MultipleChoiceDetails from "./multiple-choice-details";
import ImageQuestionDetails from "./image-question-details";

const QuestionComponent = {
  "multiple_choice": MultipleChoiceDetails,
  "image_question": ImageQuestionDetails,
};

export default ({question, answers}) => {
  const QComponent = QuestionComponent[question.get("type")];
  if (!QComponent) {
    return <span />;
  }
  return <QComponent question={question} answers={answers} />;
};
