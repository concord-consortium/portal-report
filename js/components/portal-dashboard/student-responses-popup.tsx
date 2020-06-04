import React from "react";
import { PopupHeader } from "./popup-header";
import { CustomSelect, SelectItem } from "./custom-select";
import { AnonymizeStudents } from "./anonymize-students";
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS } from "../../actions/dashboard";
import { NumberOfStudentsContainer } from "./num-students-container";

import css from "../../../css/portal-dashboard/student-responses-popup.less";
import cssClassNav from "../../../css/portal-dashboard/class-nav.less";

interface IProps {
    clazzName: string;
    setStudentSort: (value: string) => void;
    trackEvent: (category: string, action: string, label: string) => void;
    studentCount: number;
    setAnonymous: (value: boolean) => void;
}

export class StudentResponsePopup extends React.PureComponent<IProps> {
    render() {
        const { setAnonymous } = this.props;
        return (
            <div className={css.popup}>
                <div><PopupHeader />
                </div>
                <div>
                    <div className={css.leftColumn}>
                        <div>View list by:</div>
                        <div className={cssClassNav.classNav} data-cy="class-nav">
                            {this.renderClassSelect()}
                            <AnonymizeStudents setAnonymous={setAnonymous} />
                            <NumberOfStudentsContainer studentCount={this.props.studentCount} />
                            {this.renderStudentSort()}
                            <div>Project highlighted</div>
                        </div>
                    </div>
                    <div className={css.middleColumn} data-cy="middle-column">
                        <div  data-cy="questionNav">Question here</div>
                        <div  data-cy="question-text">Question text here</div>
                    </div>
                    <div className={css.rightColumn} data-cy="right-column">
                        <div data-cy="provide-written-feedback-toggle">feedback toggle</div>
                        <div data-cy="give-score-toggle">give score toggle</div>
                        <div data-cy="max-score-input-field">max score input field</div>
                        <div data-cy="feedback-and-scoring-status">feddback and scoring status</div>
                    </div>
                </div>
                <div data-cy="student-list">Student List</div>
                <div data-cy="student-table">Student Table</div>
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
        const items: SelectItem[] = [{ action: SORT_BY_NAME, name: "Student Name" },
        { action: SORT_BY_MOST_PROGRESS, name: "Most Progress" },
        { action: SORT_BY_LEAST_PROGRESS, name: "Least Progress" }];
        const { setStudentSort, trackEvent } = this.props;
        return (
            <div className={css.studentSort}>
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
}
