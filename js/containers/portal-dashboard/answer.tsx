import React from "react";
import { getAnswersByQuestion } from "../../selectors/report-tree";
import { connect } from "react-redux";

import css from "../../../css/portal-dashboard/answer.less";

interface AnswerIcon {
  type: string;
  icon: string;
}

const AnswerIcons: AnswerIcon[] = [
  {
    type: "open_response",
    icon: "#open-response-complete",
  },
  {
    type: "image_question",
    icon: "#image-open-response-complete",
  },
  {
    type: "iframe_interactive",
    icon: "#interactive-complete",
  },
];

interface IProps {
  answer: Map<any, any>;
  question: Map<any, any>;
  student: Map<any, any>;
}

class Answer extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    const { answer, question } = this.props;
    return (
      <div className={css.answer}>
      { answer && (!question.get("required") || answer.get("submitted"))
        ? this.renderAnswer()
        : this.renderNoAnswer() }
      </div>
    );
  }

  private renderAnswer = () => {
    const { answer, question } = this.props;
    const type = answer.get("questionType");
    let iconId = "";
    if (type === "multiple_choice") {
      iconId = "#multiple-choice-non-scored";
      if (question.get("scored")) {
        iconId = answer.get("correct") ? "#multiple-choice-correct" : "#multiple-choice-incorrect";
      }
    } else {
      const answerIcon = AnswerIcons.find(a => a.type === answer.get("questionType"));
      iconId = answerIcon ? answerIcon.icon : "#interactive-complete";
    }
    return (
      <div className={css.answerContent}>
        <svg className={css.icon}>
          <use xlinkHref={iconId} />
        </svg>
      </div>
    );
  }

  renderNoAnswer = () => {
    return (
      <div className={`${css.answerContent} ${css.noAnswer}`} />
    );
  }
}

function mapStateToProps(state: any, ownProps: any): Partial<IProps> {
  return {
    answer: getAnswersByQuestion(state)
      .getIn([ownProps.question.get("id"), ownProps.student.get("id")])
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Answer);
