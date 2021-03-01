import React from "react";
import { Map } from "immutable";
import { QuestionTypes } from "../../util/question-utils";
import LaunchIcon from "../../../img/svg-icons/launch-icon.svg";
import { Question } from "./questions/question";
import { TrackEventFunction } from "../../actions";

import css from "../../../css/portal-dashboard/question-area.less";

interface IProps {
  currentQuestion?: Map<string, any>;
  hideQuestion: boolean;
  useMinHeight?: boolean;
  hasTeacherEdition: boolean;
  trackEvent: TrackEventFunction;
}

export class QuestionArea extends React.PureComponent<IProps>{
  render() {
    const { currentQuestion, hideQuestion, useMinHeight, hasTeacherEdition, trackEvent } = this.props;
    const teacherEditionButtonClasses = css.teacherEditionButton;
    const teacherEditionBadge = css.teacherEditionBadge;
    const type = currentQuestion?.get("type");
    const scored = currentQuestion?.get("scored");
    const typeText = type?.replace(/_/gm, ' ');
    const interactiveName = type === "iframe_interactive" && currentQuestion?.get("name");
    const questionType = QuestionTypes.find(qt => qt.type === type && qt.scored === scored);
    const QuestionIcon = questionType?.icon;
    const activityURL = currentQuestion?.get("questionUrl");

    return (
      <div className={`${css.questionContentArea} ${hideQuestion ? css.hidden : ""}`}>
        <div className={css.questionTypeHeader}>
          <div className={css.leftTitle}>
            <QuestionIcon className={`${css.icon} ${css.questionTypeIcon}`} />
            <span className={css.questionTypeTitle} data-cy="question-title">
              {interactiveName || typeText}
            </span>
          </div>
          <div className={css.rightIcons}>
            <a className={css.externalLinkButton} href={activityURL} target="_blank" data-cy="open-activity-button" onClick={() => trackEvent("Portal-Dashboard", "OpenExternalLink", {label: activityURL})}>
              <LaunchIcon className={css.icon} />
            </a>
            { // FIXME: notice how the 'teacher-edition' url is setup, this will not work with the activity player
            }
            {hasTeacherEdition &&
              <a className={css.teacherEditionIcon} href={`${activityURL}/?mode=teacher-edition`} target="_blank" data-cy="open-teacher-edition-button" onClick={() => trackEvent("Portal-Dashboard", "OpenTeacherEdition", {label: `${activityURL}/?mode=teacher-edition`})}>
                <div className={teacherEditionButtonClasses}>
                  <LaunchIcon className={css.icon} />
                </div>
                <div className={teacherEditionBadge}>TE</div>
              </a>
          }
          </div>
        </div>
        <div className={`${css.questionTextArea} ${!useMinHeight ? css.minHeight : ""}`} data-cy="question-content">
          <Question question={currentQuestion} />
        </div>
      </div>
    );
  }
}
