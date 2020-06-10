/* eslint-disable no-console */
import React from "react";
import { Map } from "immutable";
import { PopupHeader } from "./popup-header";
import { PopupClassNav } from "./popup-class-nav";
import { PopupQuestionContainer } from "./popup-question-area";
import { StudentNames } from "./student-names";
import { StudentAnswers } from "./student-answers";

import css from "../../../css/portal-dashboard/student-responses-popup.less";
import { setStudentSort } from "../../actions/dashboard";


interface IProps {
    clazzName: string;
    currentActivity: any;
    currentQuestion?: Map<string, any>;
    isAnonymous: boolean;
    isAllResponsesReport: boolean;
    questions?: Map<string, any>;
    report: any;
    sortedQuestionIds?: string[];
    studentCount: number;
    students: any;
    setAnonymous: (value: boolean) => void;
    setCurrentActivity: (activityId: string) => void;
    setQuestionExpanded: ((questionId: string) => void);
    setStudentSort: (value: string) => void;
    toggleCurrentQuestion: (questionId: string) => void;
    trackEvent: (category: string, action: string, label: string) => void;
}

export class StudentResponsePopup extends React.PureComponent<IProps> {
    render() {
        const { currentActivity, currentQuestion, questions, report, sortedQuestionIds, students, studentCount, setAnonymous, toggleCurrentQuestion, setCurrentActivity, trackEvent } = this.props;
        // const wrapperClass = css.popup + css.visible;
        const isAnonymous = report ? report.get("anonymous") : true;
        const isAllResponsesReport = true;

        return (
            <div className={`${css.popup} ${css.open}`} >
                <PopupHeader activityName={currentActivity} />
                <div className={`${css.tableHeader}`} data-cy="table-header-area">
                    <PopupClassNav studentCount={studentCount} setAnonymous={setAnonymous} setStudentSort={setStudentSort} trackEvent={trackEvent} />
                    <PopupQuestionContainer currentQuestion={currentQuestion} questions={questions} sortedQuestionIds={sortedQuestionIds} toggleCurrentQuestion={toggleCurrentQuestion} setCurrentActivity={setCurrentActivity} />
                </div>
                <div className={css.responsesArea}>
                    <div className={`${css.studentListColumn} ${css.column}`}>
                        <div className={`${css.studentNamesList}`} data-cy="student-list">
                            <StudentNames
                                students={students}
                                isAnonymous={isAnonymous}
                                isAllResponsesReport={isAllResponsesReport}
                            />
                        </div>
                    </div>
                    <div className={`${css.column} ${css.responseColumn}`} data-cy="middle-column">
                        <div className={`${css.studentAnswersList}`}>
                            <div className={css.studentAnswersRow}>
                                <div className={css.studentAnswer}>answer 1</div>
                            </div>
                            <div className={css.studentAnswersRow}>
                                <div className={css.studentAnswer}>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sed tincidunt arcu. Proin eu fringilla tellus, sit amet facilisis tellus. Phasellus nec ante scelerisque, varius leo ut, molestie nisl. Donec faucibus ligula a faucibus lobortis. Suspendisse ultrices est sit amet metus eleifend, vel varius nisi rutrum. Nullam maximus blandit leo eu pharetra. Nam in interdum elit, accumsan semper nunc. Vestibulum condimentum velit nec ligula pretium interdum. In sit amet purus enim. Integer tristique dapibus ligula, quis malesuada nunc venenatis vel. Duis fermentum arcu non sem malesuada finibus. Donec non libero consequat, semper dui a, laoreet mi. Quisque interdum vitae sapien sed molestie. Vivamus vel massa in nibh sagittis aliquam et a nunc.
                                </div>
                            </div>
                            <div className={css.studentAnswersRow}>
                                <div className={css.studentAnswer}>answer 3</div>
                            </div>
                            <div className={css.studentAnswersRow}>
                                <div className={css.studentAnswer}>answer 4</div>
                            </div>
                            <div className={css.studentAnswersRow}>
                                <div className={css.studentAnswer}>answer 3</div>
                            </div>
                            <div className={css.studentAnswersRow}>
                                <div className={css.studentAnswer}>answer 4</div>
                            </div>
                            {/* { <StudentAnswers
                                activities={activityTrees}
                                currentActivity={currentActivity}
                                expandedActivities={expandedActivities}
                                students={students}
                            /> } */}
                        </div>
                    </div>
                    {/* <div className={`${css.column} ${css.feedbackColumn}`} data-cy="right-column">
                        <div data-cy="provide-written-feedback-toggle">feedback toggle</div>
                        <div data-cy="give-score-toggle">give score toggle</div>
                        <div data-cy="max-score-input-field">max score input field</div>
                        <div data-cy="feedback-and-scoring-status">feddback and scoring status</div>
                    </div> */}
                </div>
            </div>

        );
    }



}
