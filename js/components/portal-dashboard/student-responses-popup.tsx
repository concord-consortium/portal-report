/* eslint-disable no-console */
import React from "react";
import { Map } from "immutable";
import { PopupHeader } from "./popup-header";
import { CustomSelect, SelectItem } from "./custom-select";
import { AnonymizeStudents } from "./anonymize-students";
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS } from "../../actions/dashboard";
import { NumberOfStudentsContainer } from "./num-students-container";
import { QuestionNavigator } from "./question-navigator";

import css from "../../../css/portal-dashboard/student-responses-popup.less";
import cssClassNav from "../../../css/portal-dashboard/class-nav.less";
import cssQuestionNav from "../../../css/portal-dashboard/question-overlay.less";


interface IProps {
    clazzName: string;
    setStudentSort: (value: string) => void;
    trackEvent: (category: string, action: string, label: string) => void;
    studentCount: number;
    setAnonymous: (value: boolean) => void;
    currentActivity: any;
    currentQuestion?: Map<string, any>;
    questions?: Map<string, any>;
    sortedQuestionIds?: string[];
    toggleCurrentQuestion: (questionId: string) => void;
    setCurrentActivity: (activityId: string) => void;
    setQuestionExpanded: ((questionId: string) => void);
    cssToUse: any;
}

export class StudentResponsePopup extends React.PureComponent<IProps> {
    render() {

        const { setAnonymous, currentActivity, currentQuestion, questions, sortedQuestionIds, toggleCurrentQuestion, setCurrentActivity } = this.props;
        // const wrapperClass = css.popup + css.visible;
        const cssToUse = css;

        // if (currentActivity) {
        //     wrapperClass += " " + css.visible;
        // }
        return (
            <div className={`${css.popup} ${css.open}`} >
                <PopupHeader activityName={currentActivity} />
                <div>
                    <div className={`${css.studentListColumn} ${css.column}`}>
                        {this.renderViewListOptions()}
                        <div className={`${css.columns} ${cssClassNav.classNav} ${css.popupClassNav}`} data-cy="class-nav">
                            <AnonymizeStudents setAnonymous={setAnonymous} />
                            <NumberOfStudentsContainer studentCount={this.props.studentCount} />
                            {this.renderStudentSort()}
                            {this.renderSpotlightToggle()}
                        </div>
                    </div>
                    <div className={`${css.column} ${css.responseColumn}`} data-cy="middle-column">
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
                    {/* <div className={`${css.column} ${css.feedbackColumn}`} data-cy="right-column">
                        <div data-cy="provide-written-feedback-toggle">feedback toggle</div>
                        <div data-cy="give-score-toggle">give score toggle</div>
                        <div data-cy="max-score-input-field">max score input field</div>
                        <div data-cy="feedback-and-scoring-status">feddback and scoring status</div>
                    </div> */}
                </div>
                {/* <div data-cy="student-list">Student List</div>
                <div data-cy="student-table">Student Table</div> */}
            </div>

        );
    }

    private renderClassSelect = () => {
        const { clazzName, trackEvent } = this.props;
        return (
            <div className={css.chooseClass}>
                <CustomSelect
                    items={[{ action: "", name: clazzName }]}
                    onSelectItem={(() => { })}
                    trackEvent={trackEvent}
                    iconId={"icon-class"}
                    dataCy={"choose-class"}
                />
            </div>
        );
    }

    private renderStudentSort = () => {
        const items: SelectItem[] = [{ action: SORT_BY_NAME, name: "All Students" },
        { action: SORT_BY_MOST_PROGRESS, name: "Most Progress" },
        { action: SORT_BY_LEAST_PROGRESS, name: "Least Progress" }];
        const { setStudentSort, trackEvent } = this.props;
        return (
            <div className={cssClassNav.studentSort}>
                <CustomSelect
                    items={items}
                    onSelectItem={setStudentSort}
                    trackEvent={trackEvent}
                    iconId={"icon-sort"}
                    dataCy={"sort-students"}
                />
            </div>
        );
    }

    private renderViewListOptions() {
        return (
            <div className={`${css.viewListOption} ${css.columnHeader}`}>View list by:
                <div className={`${css.listByStudents} ${css.selected}`}>
                    <svg className={`${css.optionIcon}  `}>
                        <use xlinkHref={"#icon-student-view"} />
                    </svg>
                </div>
                <div className={`${css.listByQuestions}`}>
                    <svg className={`${css.optionIcon}`}>
                        <use xlinkHref={"#icon-question-view"} />
                    </svg>
                </div>
            </div>
        );
    }

    private renderSpotlightToggle() {
        return (
            <div className={`${css.spotlightToggle}`}>
                <div className={`${css.spotlightContainer}`}>
                    <svg className={`${css.spotlightIcon}`}>
                        <use xlinkHref={"#icon-spotlight"} />
                    </svg>
                </div>
                <span>Spotlight selected</span>
            </div>
        );
    }
}
