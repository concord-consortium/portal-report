import React, { PureComponent } from "react";
import QuestionForClass from "../../components/report/question-for-class";
import QuestionForStudent from "../../components/report/question-for-student";
import { getAnswerTrees } from "../../selectors/report-tree";
import { connect } from "react-redux";

export default class Question extends PureComponent {
  render() {
    const { question, answers, students, reportFor, url } = this.props;
    if (reportFor === "class") {
      return <QuestionForClass question={question} answers={answers} students={students} url={url} />;
    } else {
      return <QuestionForStudent question={question} answers={answers} student={reportFor} url={url} />;
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    answers: getAnswerTrees(state).toList().filter(answer => answer.get("questionId") === ownProps.question.get("id")),
    students: state.getIn(["report", "students"]).toList()
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Question);
