import React from "react";

import css from "../../../css/portal-dashboard/choice-stats.less";

interface IProps {
  correctAnswerDefined?: boolean;
  count?: number;
  isCorrect?: boolean;
  isNoResponse?: boolean;
  percentage?: number;
}

const ChoiceStats: React.FC<IProps> = (props) => {
  const { correctAnswerDefined, count, isCorrect, isNoResponse, percentage } = props;

  let graphBarClass = `${css.choiceGraphBar}`;
  if (isNoResponse) {
    graphBarClass += ` ${css.noResponse}`;
  } else if (isCorrect && correctAnswerDefined) {
    graphBarClass += ` ${css.correct}`;
  } else if (correctAnswerDefined) {
    graphBarClass += ` ${css.incorrect}`;
  }

  return (
    <div className={css.choiceStats} data-cy="multiple-choice-choice-stats">
      <div className={css.choiceGraph} data-cy="multiple-choice-choice-graph">
        <div className={graphBarClass} style={{ width: `${percentage ?? 0}%` }}></div>
      </div>
      <div className={css.choiceCount} data-cy="multiple-choice-choice-count">
        {count}
      </div>
      <div className={css.choicePercent} data-cy="multiple-choice-choice-percent">
        {`${percentage ?? 0}%`}
      </div>
    </div>
  );
};

export default ChoiceStats;
