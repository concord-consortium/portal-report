import React, { PureComponent } from "react";
import Answer from "../../components/report/answer";
import { CompareAnswerCheckboxContainer } from "./compare-answer";
import ShowCompareContainer from "./show-compare";
import { connect } from "react-redux";

import "../../../css/report/answers-table.less";

class AnswersTable extends PureComponent {
  getFeedback(answer) {
    return this.props.questionFeedbacks?.[answer.get("id")];
  }

  getFeedbackSettings(question) {
    return question && this.props.feedbackSettings.getIn(["questionSettings", question?.id]) || Map({});
  }

  getAnswerForStudent(student) {
    const { answerMap } = this.props;
    const result = answerMap?.[student.get("id")];
    if (result) {
      return result;
    } else {
      return {
        questionType: "NoAnswer"
      };
    }
  }

  render() {
    const {question, students, hidden, showCompare, anonymous} = this.props;
    const feedbackSettings = this.getFeedbackSettings(question);
    const scoreEnabled = (!anonymous) && feedbackSettings?.scoreEnabled || false;
    const feedbackEnabled = (!anonymous) && feedbackSettings?.feedbackEnabled || false;
    const feedbackTH = feedbackEnabled ? <th>Feedback</th> : null;
    const scoreTH = scoreEnabled ? <th>Score</th> : null;
    const selectTH = showCompare ? <th className="select-header">Select</th> : null;
    return (
      <table className={`answers-table ${hidden ? "hidden" : ""}`} data-cy="multiple-choice-answers-table">
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
              const feedback = this.getFeedback(answer);
              return (
                <AnswerRow
                  key={student?.id}
                  student={student}
                  answer={answer}
                  question={question}
                  feedback={feedback}
                  showFeedback={feedbackEnabled}
                  showScore={scoreEnabled}
                  showCompare={showCompare}
                />
              );
            })
          }
        </tbody>
      </table>
    );
  }
}

function AnswerRow({student, answer, question, feedback, showScore, showFeedback, showCompare}) {
  const hasAnswer = answer?.questionType !== "NoAnswer";
  const score = feedback && feedback?.score;
  const textFeedback = feedback && feedback?.feedback;
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
      <td>{student?.name}</td>
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
    questionFeedbacks: state.getIn(["feedback", "questionFeedbacks"]),
    feedbackSettings: state.getIn(["feedback", "settings"]),
    anonymous: state.getIn(["report", "anonymous"]),
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(AnswersTable);

AnswersTable.defaultProps = {
  showCompare: true,
  answerMap: {}
};
