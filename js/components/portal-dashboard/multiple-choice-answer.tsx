import React from "react";

import css from "../../../css/portal-dashboard/answer.less";

interface IProps {
  answer: any;
  question: any;
}

export const MultipleChoiceAnswer: React.FC<IProps> = (props) => {
  const { answer, question } = props;
  let iconId = "#multiple-choice-non-scored";
  if (question.get("scored")) {
    iconId = answer.get("correct") ? "#multiple-choice-correct" : "#multiple-choice-incorrect";
  }

  return (
    <div className={css.answer}>
      <svg className={css.icon}>
        <use xlinkHref={iconId} />
      </svg>
    </div>
  );
};

