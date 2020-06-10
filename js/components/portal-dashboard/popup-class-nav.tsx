import React from "react";
import { AnonymizeStudents } from "./anonymize-students";
import { CustomSelect, SelectItem } from "./custom-select";
import { NumberOfStudentsContainer } from "./num-students-container";
import { SORT_BY_NAME } from "../../actions/dashboard";


import css from "../../../css/portal-dashboard/student-responses-popup.less";
import cssClassNav from "../../../css/portal-dashboard/class-nav.less";


interface IProps {
    studentCount: number;
    setAnonymous: (value: boolean) => void;
    setStudentSort: (value: string) => void;
    trackEvent: (category: string, action: string, label: string) => void;
}

export class PopupClassNav extends React.PureComponent<IProps>{
    render() {
        const { studentCount, setAnonymous } = this.props;

        return (
            <div className={`${css.column}`}>
                {this.renderViewListOptions()}
                < div className={`${css.columns} ${cssClassNav.classNav} ${css.popupClassNav}`} data-cy="class-nav" >
                    <AnonymizeStudents setAnonymous={setAnonymous} />
                    <NumberOfStudentsContainer studentCount={studentCount} />
                    {this.renderStudentSort()}
                    {this.renderSpotlightToggle()}
                </div >
            </div>
            );
    }

    private renderStudentSort = () => {
        const items: SelectItem[] = [{ action: SORT_BY_NAME, name: "All Students" }];
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