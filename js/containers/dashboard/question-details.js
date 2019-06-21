import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";
import Button from "../../components/common/button";
import ReportQuestionDetails from "../../components/report/question-details";
import AnswersTable from "../report/answers-table";
import css from "../../../css/dashboard/question-details.less";
import { getAnswerTrees } from "../../selectors/report-tree";
import { connect } from "react-redux";

export default class QuestionDetails extends PureComponent {
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
    const { selectedQuestion, answers, students, onClose } = this.props;
    const { answersVisible } = this.state;
    const prompt = selectedQuestion && selectedQuestion.get("prompt");
    return (
      <Modal
        show={selectedQuestion !== null}
        onHide={onClose}
      >
        <Modal.Body>
          {
            selectedQuestion &&
            <div
              className={css.question} >
              <div dangerouslySetInnerHTML={{ __html: prompt }} />
              <ReportQuestionDetails question={selectedQuestion} answers={answers} students={students} />
              <Button onClick={this.toggleAnswersVisibility}>
                {answersVisible ? "Hide responses" : "Show responses"}
              </Button>
              {answersVisible ? <AnswersTable question={selectedQuestion} answers={answers} students={students} showCompare={false} /> : ""}
            </div>
          }
        </Modal.Body>
        <Modal.Footer style={{display: "flex", justifyContent: "center"}}>
          <Button onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    answers: ownProps.selectedQuestion ?
      getAnswerTrees(state).toList().filter(answer => answer.get("questionId") === ownProps.selectedQuestion.get("id")) : []
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(QuestionDetails);
