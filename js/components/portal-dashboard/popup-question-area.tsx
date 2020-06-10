import React from "react";
import { Map } from "immutable";
import { QuestionNavigator } from "./question-navigator";
import css from "../../../css/portal-dashboard/student-responses-popup.less";
import cssQuestionNav from "../../../css/portal-dashboard/question-overlay.less";

interface IProps {
    currentQuestion?: Map<string, any>;
    questions?: Map<string, any>;
    sortedQuestionIds?: string[];
    toggleCurrentQuestion: (questionId: string) => void;
    setCurrentActivity: (activityId: string) => void;
}
export class PopupQuestionContainer extends React.PureComponent<IProps>{
    render() {
        const cssToUse = css;
        const { currentQuestion, questions, sortedQuestionIds, toggleCurrentQuestion, setCurrentActivity } = this.props;
        return (
            <div className={`${css.column} ${css.questionArea}`}>
                <div className={`${cssQuestionNav.visible} ${css.columnHeader} ${css.popupQuestionNavigator}`} data-cy="questionNav">
                    <QuestionNavigator cssToUse={cssToUse}
                        currentQuestion={currentQuestion}
                        questions={questions}
                        sortedQuestionIds={sortedQuestionIds}
                        toggleCurrentQuestion={toggleCurrentQuestion}
                        setCurrentActivity={setCurrentActivity} />
                </div>
                <div className={`${css.popupQuestionDiv}`} data-cy="question-text">
                    <div className={`${css.questionTypeHeader}`}>
                        <div className={`${css.leftTitle}`}>
                            <svg className={`${css.icon} ${css.questionTypeIcon}`}>
                                <use xlinkHref="#text-question" />
                            </svg>
                            <span className={css.questionTypeTitle}>Question Type</span>
                        </div>
                        <div className={`${css.rightIcons}`}>
                            <a className={`${css.externalLinkButton}`} target="_blank">
                                <svg className={`${css.icon}`}>
                                    <use xlinkHref="#external-link" />
                                </svg>
                            </a>
                            <a className={`${css.teacherEditionButton}`} target="_blank">
                                <svg className={`${css.icon}`}>
                                    <use xlinkHref="#external-link" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div className={css.questionText}>
                        Question text here
            </div>
                </div>
            </div>
        );
    }
}
