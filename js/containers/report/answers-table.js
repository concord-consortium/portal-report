import React, { PureComponent } from "react";
import Answer from "../../components/report/answer";
import { CompareAnswerCheckboxContainer } from "./compare-answer";
import ShowCompareContainer from "./show-compare";
import { connect } from "react-redux";
import { fromJS } from "immutable";

import "../../../css/report/answers-table.less";

class AnswersTable extends PureComponent {
  getLatestFeedback(answer) {
    return answer.get("feedback");
    // const feedbackKey = answer.get("feedbacks") && answer.get("feedbacks").last();
    // return this.props.feedbacks && this.props.feedbacks.get(feedbackKey);
  }

  getAnswerForStudent(student) {
    const { answers } = this.props;
    const result = answers.filter(answer => answer.get("platformUserId") === student.get("id"));
    if (result.size === 0) {
      return fromJS({
        questionType: "NoAnswer"
      });
    } else {
      return result.get(0);
    }
  }

  render() {
    const {question, students, hidden, showCompare, anonymous} = this.props;
    const scoreEnabled = (!anonymous) && question && question.get("scoreEnabled");
    const feedbackEnabled = (!anonymous) && question && question.get("feedbackEnabled");
    const feedbackTH = feedbackEnabled ? <th>Feedback</th> : null;
    const scoreTH = scoreEnabled ? <th>Score</th> : null;
    const selectTH = showCompare ? <th className="select-header">Select</th> : null;
    return (
      <table className={`answers-table ${hidden ? "hidden" : ""}`}>
        <tbody>
          <tr>
            <th className="student-header">Student</th>
            <th>Response</th>
            {feedbackTH}
            {scoreTH}
            {selectTH}

          </tr>
          {
            students.map(student => {
              const answer = this.getAnswerForStudent(student);
              const feedback = this.getLatestFeedback(answer);
              return (<AnswerRow
                key={student.get("id")}
                student={student}
                answer={answer}
                question={question}
                feedback={feedback}
                showFeedback={feedbackEnabled}
                showScore={scoreEnabled}
                showCompare={showCompare}
              />);
            })
          }
        </tbody>
      </table>
    );
  }
}

function AnswerRow({student, answer, question, feedback, showScore, showFeedback, showCompare}) {
  const hasAnswer = answer.get("questionType") !== "NoAnswer";
  const score = feedback && feedback.get("score");
  const textFeedback = feedback && feedback.get("feedback");
  const scoreTD = showScore ? <td className="score">{score}</td> : null;
  const feedbackTD = showFeedback ? <td className="feedback">{textFeedback}</td> : null;
  const compareDIV = hasAnswer && showCompare
    ? <div>
      <CompareAnswerCheckboxContainer answer={answer} />
      <ShowCompareContainer answer={answer}  />
    </div>
    : "";

  return (
    <tr>
      <td>{student.get("name")}</td>
      <td> <Answer answer={answer} question={question} /> </td>
      {feedbackTD}
      {scoreTD}
      <td className="select-answer-column">
        {compareDIV}
      </td>
    </tr>
  );
}

function mapStateToProps(state, ownProps) {
  return {
    feedbacks: state.get("feedbacks"),
    anonymous: state.getIn(["report", "anonymous"]),
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(AnswersTable);

AnswersTable.defaultProps = {
  showCompare: true,
  answers: fromJS([])
};
