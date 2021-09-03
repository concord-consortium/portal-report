import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";
import SmallCloseIcon from "../../../../img/svg-icons/small-close-icon.svg";
import { getQuestionIcon } from "../../../util/question-utils";
import striptags from "striptags";
import { Map } from "immutable";

import css from "../../../../css/portal-dashboard/answers/answer-modal.less";

interface IProps {
  answer: Map<any, any>;
  show: boolean;
  onHide: (value: boolean) => void;
  question?: Map<string, any>;
  studentName: string;
}

export class AnswerModal extends PureComponent<IProps> {

  render() {
    const { answer, show, onHide, question } = this.props;
    const isQuestion = false;
    const type = answer?.get("questionType");
    const questionType = QuestionTypes.find(qt => qt.type === type);
    const QuestionIcon = questionType?.icon;
    const drawingPrompt = question?.get("drawingPrompt") ? striptags((question.get("drawingPrompt")).replace(/&nbsp;/g,' ')) : "";
    const questionPrompt = question?.get("prompt") ? striptags((question.get("prompt")).replace(/&nbsp;/g,' ')) : "";
    const prompt = drawingPrompt + questionPrompt;

    if (!answer) { return null; }
    return (
      <Modal show={show} onHide={onHide} animation={false} dialogClassName={css.lightbox} centered data-cy="answer-lightbox">
        {this.renderModalHeader(isQuestion)}
        <Modal.Body className={css.lightboxBody}>
          <div className={css.questionPrompt} data-cy="question-prompt">
            <QuestionIcon className={`${css.icon} ${css.questionTypeIcon}`} />
            <span className={css.questionPromptText} data-cy="question-prompt-text">
              {prompt}
            </span>
          </div>
          <div className={css.contentArea} data-cy="lightbox-content-area">
            {this.renderModalAnswerContent()}
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  private renderModalHeader = (isQuestion: boolean) => {
    const { studentName } = this.props;

    return (
      <Modal.Header className={css.lightboxHeader + (isQuestion ? css.question : " " + css.answer)} data-cy="modal-header">
        <div className={css.studentName} data-cy="student-name">
          {studentName}
        </div>
        <div className={css.closeButton} data-cy="close-button" onClick={this.handleCloseLightbox}>
          <SmallCloseIcon className={css.closeIconSVG} />
        </div>
      </Modal.Header>
    );
  }

  private renderModalAnswerContent = () => {
    const { answer } = this.props;
    const contentAnswer = answer.get("answer");
    const answerText = contentAnswer.get("text") || "";

    return (
      <div className={css.studentResponse} data-cy="student-response-area">
        {this.renderAnswer()}
        <div className={css.responseText} data-cy="response-note">
          {answerText}
        </div>
      </div>
    );
  }

  private handleCloseLightbox = () => {
    const { show, onHide } = this.props;
    if (show) {
      onHide(show);
    }
  }

  private renderAnswer = () => {
    const { answer } = this.props;
    const contentAnswer = answer.get("answer");

    return (
      <img src={contentAnswer.get("imageUrl")} data-cy="answer-image" />
    );
  }
}
