import React, { PureComponent } from "react";
import QuestionForClass from "../../components/report/question-for-class";
import QuestionForStudent from "../../components/report/question-for-student";
import { getAnswerTreesNew } from "../../selectors/report-tree";
import { getSortedStudents } from "../../selectors/report";
import { connect } from "react-redux";
import { Map } from "immutable";

export default class Question extends PureComponent {
  render() {
    const { question, answerMap, answerList, students, reportFor, url } = this.props;
    if (reportFor === "class") {
      return <QuestionForClass question={question} answerMap={answerMap} answerList={answerList} students={students} url={url} />;
    } else {
      return <QuestionForStudent question={question} answers={answerList} student={reportFor} url={url} />;
    }
  }
}

function mapStateToProps(state, ownProps) {
  const answerMap = getAnswerTreesNew(state).get(ownProps.question.get("id")) || Map();
  const students = getSortedStudents(state);
  return {
    answerMap,
    answerList: answerMap.toList(),
    students};
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Question);
