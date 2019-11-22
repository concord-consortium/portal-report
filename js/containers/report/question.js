import React, { PureComponent } from "react";
import { trackEvent } from "../../actions/index";
import QuestionForClass from "../../components/report/question-for-class";
import QuestionForStudent from "../../components/report/question-for-student";
import { getAnswersByQuestion } from "../../selectors/report-tree";
import { getSortedStudents } from "../../selectors/report";
import { connect } from "react-redux";
import { Map } from "immutable";

export default class Question extends PureComponent {
  render() {
    const { question, answerMap, answerList, students, reportFor, url, trackEvent } = this.props;
    if (reportFor === "class") {
      return <QuestionForClass question={question} answerMap={answerMap} answerList={answerList} students={students} url={url} trackEvent={trackEvent} />;
    } else {
      return <QuestionForStudent question={question} answerMap={answerMap} student={reportFor} url={url} trackEvent={trackEvent} />;
    }
  }
}

function mapStateToProps(state, ownProps) {
  const answerMap = getAnswersByQuestion(state).get(ownProps.question.get("id")) || Map();
  const students = getSortedStudents(state);
  return {
    answerMap,
    answerList: answerMap.toList(),
    students
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    trackEvent: (category, action, label) => dispatch(trackEvent(category, action, label))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Question);
