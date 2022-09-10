import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";
import Button from "../../components/common/button";
import ReportQuestionDetails from "../../components/report/question-details";
import AnswersTable from "../report/answers-table";
import css from "../../../css/dashboard/question-details.less";
import { getAnswersByQuestion } from "../../selectors/report-tree";
import { connect } from "react-redux";

export class QuestionDetails extends PureComponent {
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
    const { selectedQuestion, answerMap, answerList, students, onClose } = this.props;
    const { answersVisible } = this.state;
    const prompt = selectedQuestion && selectedQuestion.get("prompt");
    return (
      <Modal
        show={selectedQuestion !== null}
        onHide={onClose}
        animation={false}
      >
        <Modal.Body>
          {
            selectedQuestion &&
            <div
              className={css.question} >
              <div dangerouslySetInnerHTML={{ __html: prompt }} />
              <ReportQuestionDetails question={selectedQuestion} answers={answerList} students={students} />
              <Button onClick={this.toggleAnswersVisibility}>
                {answersVisible ? "Hide responses" : "Show responses"}
              </Button>
              {answersVisible ? <AnswersTable question={selectedQuestion} answerMap={answerMap} students={students} showCompare={false} /> : ""}
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
  // Is there a better way to do this?
  const answerMap = ownProps.selectedQuestion ?
    getAnswersByQuestion(state).get(ownProps.selectedQuestion.get("id")) || Map() :
    Map();

  return {
    answerMap,
    // This could probably be optimized, by having all of the children work with the
    // the answerMap, but I'd guess that toList is pretty efficient
    answerList: answerMap.toList()
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(QuestionDetails);
