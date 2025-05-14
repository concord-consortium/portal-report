import React from "react";
import { Map } from "immutable";
import CorrectIcon from "../../../img/svg-icons/a-mc-scored-correct-icon.svg";
import IncorrectIcon from "../../../img/svg-icons/a-mc-scored-incorrect-icon.svg";
import NoChoiceIcon from "../../../img/svg-icons/a-mc-no-choice-icon.svg";
import NoResponseIcon from "../../../img/svg-icons/a-mc-no-response-icon.svg";
import CompleteIcon from "../../../img/svg-icons/a-mc-nonscored-completed-icon.svg";
import MultipleAnswerCorrectIcon from "../../../img/svg-icons/a-ma-scored-correct-icon.svg";
import MultipleAnswerIncorrectIcon from "../../../img/svg-icons/a-ma-scored-incorrect-icon.svg";
import MultipleAnswerCompleteIcon from "../../../img/svg-icons/a-ma-nonscored-completed-icon.svg";
import MultipleAnswerNoAnswerIcon from "../../../img/svg-icons/a-ma-no-answer-icon.svg";
import MultipleAnswerNoResponseIcon from "../../../img/svg-icons/a-ma-no-response-icon.svg";
import ChoiceStats from "./choice-stats";

import css from "../../../css/portal-dashboard/multiple-choice-answer.less";

interface IProps {
  choice: Map<string, any>;
  correctAnswerDefined?: boolean;
  count?: number;
  multipleAnswer?: boolean;
  percentage?: number;
  selected: boolean;
  showStats?: boolean;
}

type State = "correct" | "incorrect" | "noResponse" | "selected" | "default";
interface StateIcons extends Record<State, React.ReactNode>{}
interface IconMapLevel {
  scored: Partial<StateIcons>;
  unscored: Partial<StateIcons>;
}

const iconMap: {
  multipleAnswer: IconMapLevel;
  multipleChoice: IconMapLevel;
} = {
  multipleAnswer: {
    scored: {
      correct: <MultipleAnswerCorrectIcon />,
      incorrect: <MultipleAnswerIncorrectIcon />,
      noResponse: <MultipleAnswerNoResponseIcon />
    },
    unscored: {
      selected: <MultipleAnswerCompleteIcon />,
      noResponse: <MultipleAnswerNoResponseIcon />,
      default: <MultipleAnswerNoAnswerIcon />
    }
  },
  multipleChoice: {
    scored: {
      correct: <CorrectIcon />,
      incorrect: <IncorrectIcon />,
      noResponse: <NoResponseIcon />
    },
    unscored: {
      selected: <CompleteIcon />,
      noResponse: <NoResponseIcon />,
      default: <NoChoiceIcon />
    }
  }
};

const iconForChoice = (choice: Map<string, any>, correctAnswerDefined: boolean, multipleAnswer: boolean, selected: boolean, showStats: boolean): React.ReactNode => {
  const isCorrect = choice.get("correct");
  const isNoResponse = choice.get("id") === "noResponse";
  const type = multipleAnswer ? "multipleAnswer" : "multipleChoice";
  const scoringKey = correctAnswerDefined ? "scored" : "unscored";
  let state: State;

  if (isNoResponse && selected) {
    state = "noResponse";
  } else if (scoringKey === "scored" && (showStats || selected)) {
    state = isCorrect ? "correct" : "incorrect";
  } else if (selected) {
    state = "selected";
  } else {
    state = "default";
  }

  const stateIcons = iconMap[type]?.[scoringKey];
  return stateIcons?.[state] || <NoChoiceIcon />;
};

const Choice: React.FC<IProps> = (props) => {
  const { choice, correctAnswerDefined = false, count, multipleAnswer = false, percentage, selected, showStats = false } = props;
  const isCorrect = choice.get("correct");
  const isNoResponse = choice.get("id") === "noResponse";
  const icon = iconForChoice(choice, correctAnswerDefined, multipleAnswer, selected, showStats);
  const choiceContent = isCorrect
    ? <strong>{`${choice.get("content")} (correct)`}</strong>
    : choice.get("content");

  return (
    <div className={css.choice}>
      <div className={css.choiceDetails}>
        <div className={css.choiceIcon} data-cy="multiple-choice-choice-icon">
          {icon}
        </div>
        <div className={css.choiceContent}>
          <div className={css.choiceText} data-cy="multiple-choice-choice-text">
            {choiceContent}
          </div>
        </div>
      </div>
      { showStats &&
        <ChoiceStats
          count={count}
          correctAnswerDefined={correctAnswerDefined}
          isCorrect={isCorrect}
          isNoResponse={isNoResponse}
          percentage={percentage}
        />
      }
    </div>
  );
};

export default Choice;
