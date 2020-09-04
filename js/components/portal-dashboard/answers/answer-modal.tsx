import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";
import SmallCloseIcon from "../../../../img/svg-icons/small-close-icon.svg";
import { QuestionTypes } from "../../../util/question-utils";
import { renderHTML } from "../../../util/render-html";

import css from "../../../../css/portal-dashboard/answers/answer-modal.less";
import "../../../../css/portal-dashboard/answers/answer-modal.css";

interface IProps {
  answer: Map<any, any>;
  show: boolean;
  onHide: (value: boolean) => void;
  question?: Map<any, any>;
  studentName: string;
}

export class AnswerModal extends PureComponent<IProps> {

  render() {
    const { answer, show, onHide, question, studentName } = this.props;
    const lightboxHeaderClass = `${css.lightboxHeader} ${css.answer}`;
    const type = answer?.get("questionType");
    const questionType = QuestionTypes.find(qt => qt.type === type);
    const QuestionIcon = questionType?.icon;
    const prompt = question && renderHTML(question.get("prompt"));
    const contentAnswer = answer.get("answer");
    const answerText = contentAnswer.get("text") || "";

    if (!answer) { return null; }
    return (
      <Modal show={show} onHide={onHide} animation={false} dialogClassName={css.lightbox} centered data-cy="answer-lightbox">
          <Modal.Header className={lightboxHeaderClass} data-cy="modal-header">
            <div className={css.studentName} data-cy="student-name">
              {studentName}
            </div>
            <div className={css.closeButton} data-cy="close-button" onClick={this.handleCloseLightbox}>
              <SmallCloseIcon className={css.closeIconSVG} />
            </div>
          </Modal.Header>
          <Modal.Body className={css.lightboxBody}>
            <div className={css.questionPrompt} data-cy="question-prompt">
              <QuestionIcon className={`${css.icon} ${css.questionTypeIcon}`} />
              <span className={css.questionPromptText} data-cy="question-prompt-text">
                {prompt}
              </span>
            </div>
            <div className={css.studentResponse} data-cy="student-response-area">
              <div className={css.contentArea} data-cy="response-content">
                {this.renderAnswer(type)}
              </div>
              <div className={css.responseText} data-cy="response-note">
                {answerText}
              </div>
            </div>
          </Modal.Body>
      </Modal>
    );
  }

  private handleCloseLightbox = () => {
    const { show, onHide } = this.props;
    if (show) {
      onHide(show);
    }
  }

  private renderAnswer = (type: string) => {
    const { answer } = this.props;
    const contentAnswer = answer.get("answer");

    return(
      <img src={contentAnswer.get("imageUrl")} data-cy="answer-image" />
    );
  }
}
