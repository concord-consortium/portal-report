import React, { PureComponent } from "react";
import QuestionSummary from "./question-summary";
import QuestionHeader from "./question-header";
import AnswersTable from "../../containers/report/answers-table";
import SelectionCheckbox from "../../containers/report/selection-checkbox";
import QuestionDetails from "./question-details";

import "../../../css/report/question.less";

export default class QuestionForClass extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      answersVisible: false,
    };
    this.toggleAnswersVisibility = this.toggleAnswersVisibility.bind(this);
  }

  toggleAnswersVisibility() {
    this.setState({answersVisible: !this.state.answersVisible});
  }

  render() {
    const { question, answers, students, url } = this.props;
    const { answersVisible } = this.state;
    return (
      <div>
        <div className={`question ${question.get("visible") ? "" : "hidden"}`}>
          <div className="question-header">
            <SelectionCheckbox selected={question.get("selected")} questionKey={question.get("id")} />
            <QuestionHeader question={question} url={url} />
            <a className="answers-toggle" onClick={this.toggleAnswersVisibility}>
              {answersVisible ? "Hide responses" : "Show responses"}
            </a>
          </div>
          <QuestionSummary question={question} answers={answers} students={students} />
          <QuestionDetails question={question} answers={answers} />
          { answersVisible && <AnswersTable question={question} answers={answers} /> }
        </div>
      </div>
    );
  }
}
