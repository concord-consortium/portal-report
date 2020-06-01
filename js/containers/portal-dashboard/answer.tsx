import React from "react";
import { getAnswersByQuestion } from "../../selectors/report-tree";
import { connect } from "react-redux";
import { MultipleChoiceAnswer } from "../../components/portal-dashboard/multiple-choice-answer";
import { OpenResponseAnswer } from "../../components/portal-dashboard/open-response-answer";
import { GenericAnswer } from "../../components/portal-dashboard/generic-answer";
import { NoAnswer } from "../../components/portal-dashboard/no-answer";

interface IProps {
  question: any;
  answer: any;
  student: any;
}

class Answer extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    return (
      this.renderAnswer()
    );
  }

  private renderAnswer = () => {
    const { answer, question } = this.props;
    if (answer && (!question.get("required") || answer.get("submitted"))) {
      const type = answer.get("questionType");
      if (type === "multiple_choice") {
        return (<MultipleChoiceAnswer answer={answer} question={question} />);
      } else if(type === "open_response") {
        return (<OpenResponseAnswer />);
      } else {
        return (<GenericAnswer />);
      }
    } else {
      return (<NoAnswer />);
    }
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
