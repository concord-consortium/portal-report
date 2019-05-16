import React from "react";
import MultipleChoiceDetails from "./multiple-choice-details";
import ImageQuestionDetails from "./image-question-details";

const QuestionComponent = {
  "Embeddable::MultipleChoice": MultipleChoiceDetails,
  "Embeddable::ImageQuestion": ImageQuestionDetails,
};

export default ({question}) => {
  const QComponent = QuestionComponent[question.get("type")];
  if (!QComponent) {
    return <span />;
  }
  return <QComponent question={question} />;
};
