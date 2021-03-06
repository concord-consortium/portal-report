import React from "react";
import { AnonymizeStudents } from "../anonymize-students";
import { CustomSelect, SelectItem } from "../custom-select";
import { ListViewMode } from "../../../util/misc";
import { CountContainer } from "../count-container";
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS } from "../../../actions/dashboard";
import SortIcon from "../../../../img/svg-icons/sort-icon.svg";
import StudentViewIcon from "../../../../img/svg-icons/student-view-icon.svg";
import QuestionViewIcon from "../../../../img/svg-icons/question-view-icon.svg";
import SpotlightIcon from "../../../../img/svg-icons/spotlight-icon.svg";
import { TrackEventFunction } from "../../../actions";

import css from "../../../../css/portal-dashboard/response-details/popup-class-nav.less";
import cssClassNav from "../../../../css/portal-dashboard/class-nav.less";

interface IProps {
  anonymous: boolean;
  isSpotlightOn: boolean;
  listViewMode: ListViewMode;
  onShowDialog: (show: boolean) => void;
  questionCount: number;
  setAnonymous: (value: boolean) => void;
  setStudentSort: (value: string) => void;
  sortByMethod: string;
  studentCount: number;
  setListViewMode: (value: ListViewMode) => void;
  trackEvent: TrackEventFunction;
}

export class PopupClassNav extends React.PureComponent<IProps>{
  render() {
    const { anonymous, listViewMode, questionCount, studentCount, setAnonymous } = this.props;
    return (
      <div className={`${css.popupClassNav} ${css.column}`}>
        {this.renderViewListOptions()}
        <div className={`${cssClassNav.classNav} ${css.popupClassNavControllers}`} data-cy="class-nav">
          <AnonymizeStudents anonymous={anonymous} setAnonymous={setAnonymous} />
          <CountContainer
            numItems={listViewMode==="Question" ? questionCount : studentCount}
            containerLabel={listViewMode==="Question" ? "Questions" : "Class"}
            containerLabelType={listViewMode==="Student" ? "students" : undefined}
          />
          {listViewMode==="Question" ? this.renderQuestionFilter() : this.renderStudentFilter()}
          {listViewMode==="Student" && this.renderSpotlightToggle()}
        </div>
      </div>
    );
  }

  private handleStudentSortSelect = (value: string) => () => {
    const { setStudentSort } = this.props;
    setStudentSort(value);
  }

  private renderQuestionFilter = () => {
    const { trackEvent } = this.props;
    return (
      <div className={cssClassNav.itemSort}>
        <CustomSelect
          items={[{ value: "", label: "All Questions" }]}
          trackEvent={trackEvent}
          HeaderIcon={SortIcon}
          dataCy={"sort-questions"}
          disableDropdown={true}
          key={"question-sort"}
        />
      </div>
    );
  }

  private renderStudentFilter = () => {
    const items: SelectItem[] = [{ value: SORT_BY_NAME, label: "Student Name",
                                   onSelect: this.handleStudentSortSelect(SORT_BY_NAME) },
                                 { value: SORT_BY_MOST_PROGRESS, label: "Most Progress",
                                   onSelect: this.handleStudentSortSelect(SORT_BY_MOST_PROGRESS) },
                                 { value: SORT_BY_LEAST_PROGRESS, label: "Least Progress",
                                   onSelect: this.handleStudentSortSelect(SORT_BY_LEAST_PROGRESS) }];
    const { sortByMethod, trackEvent } = this.props;
    return (
      <div className={cssClassNav.itemSort}>
        <CustomSelect
          dataCy={"sort-students"}
          HeaderIcon={SortIcon}
          items={items}
          trackEvent={trackEvent}
          value={sortByMethod}
          key={"student-sort"}
        />
      </div>
    );
  }

  private renderViewListOptions() {
    const { listViewMode, setListViewMode } = this.props;
    const listByStudentClasses = `${css.toggle} ${css.listByStudents} ${listViewMode==="Student" ? css.selected : ""}`;
    const listByQuestionsClasses = `${css.toggle} ${css.listByQuestions} ${listViewMode==="Question" ? css.selected : ""}`;
    return (
      <div className={`${css.viewListOption} ${css.columnHeader}`}>View list by:
        <div className={listByStudentClasses} data-cy="list-by-student-toggle" onClick={() => setListViewMode("Student")}>
          <StudentViewIcon className={css.optionIcon} />
        </div>
        <div className={listByQuestionsClasses} data-cy="list-by-questions-toggle" onClick={() => setListViewMode("Question")}>
          <QuestionViewIcon className={css.optionIcon} />
        </div>
      </div>
    );
  }

  private renderSpotlightToggle() {
    const spotLightContainerClasses = `${css.spotlightContainer} ${this.props.isSpotlightOn ? css.spotlightOn : ""}`;
    const handleClick = () => {
      this.props.onShowDialog(true);
      this.props.trackEvent("Portal-Dashboard", "SpotlightStudents");
    };
    return (
      <div className={css.spotlightToggle} onClick={handleClick} data-cy="spotlight-toggle">
        <div className={spotLightContainerClasses}>
          <SpotlightIcon className={css.spotlightIcon} />
        </div>
        <span>Spotlight selected</span>
      </div>
    );
  }

}
