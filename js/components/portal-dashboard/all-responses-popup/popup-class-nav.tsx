import React from "react";
import { AnonymizeStudents } from "../anonymize-students";
import { CustomSelect, SelectItem } from "../custom-select";
import { NumberOfStudentsContainer } from "../num-students-container";
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS } from "../../../actions/dashboard";
import SortIcon from "../../../../img/svg-icons/sort-icon.svg";
import StudentViewIcon from "../../../../img/svg-icons/student-view-icon.svg";
import QuestionViewIcon from "../../../../img/svg-icons/question-view-icon.svg";
import SpotlightIcon from "../../../../img/svg-icons/spotlight-icon.svg";

import css from "../../../../css/portal-dashboard/all-responses-popup/popup-class-nav.less";
import cssClassNav from "../../../../css/portal-dashboard/class-nav.less";

interface IProps {
  anonymous: boolean;
  isSpotlightOn: boolean;
  onShowDialog: (show: boolean) => void;
  setAnonymous: (value: boolean) => void;
  setStudentSort: (value: string) => void;
  sortByMethod: string;
  studentCount: number;
  trackEvent: (category: string, action: string, label: string) => void;
}
interface IState {
  inQuestionMode: boolean;
}
export class PopupClassNav extends React.PureComponent<IProps, IState>{
  constructor(props: IProps) {
    super(props);
    this.state = {
      inQuestionMode: false
    };
  }

  render() {
    const { anonymous, studentCount, setAnonymous } = this.props;

    return (
      <div className={`${css.popupClassNav} ${css.column}`}>
        {this.renderViewListOptions()}
        <div className={`${cssClassNav.classNav} ${css.popupClassNavControllers}`} data-cy="class-nav">
          <AnonymizeStudents anonymous={anonymous} setAnonymous={setAnonymous} />
          <NumberOfStudentsContainer studentCount={studentCount} />
          {this.renderStudentFilter()}
          {this.renderSpotlightToggle()}
        </div>
      </div>
    );
  }

  private handleStudentSortSelect = (value: string) => () => {
    const { setStudentSort } = this.props;
    setStudentSort(value);
  }

  private renderStudentFilter = () => {
    const items: SelectItem[] = [{ value: SORT_BY_NAME, label: "Student Name", onSelect: this.handleStudentSortSelect(SORT_BY_NAME) },
                                 { value: SORT_BY_MOST_PROGRESS, label: "Most Progress", onSelect: this.handleStudentSortSelect(SORT_BY_MOST_PROGRESS) },
                                 { value: SORT_BY_LEAST_PROGRESS, label: "Least Progress", onSelect: this.handleStudentSortSelect(SORT_BY_LEAST_PROGRESS) }];
    const { sortByMethod, trackEvent } = this.props;
    return (
      <div className={cssClassNav.studentSort}>
        <CustomSelect
          dataCy={"sort-students"}
          HeaderIcon={SortIcon}
          items={items}
          trackEvent={trackEvent}
          value={sortByMethod}
        />
      </div>
    );
  }

  private renderViewListOptions() {
    const { inQuestionMode } = this.state;
    const listByStudentClasses = `${css.toggle} ${css.listByStudents} ${!inQuestionMode ? css.selected : ""}`;
    const listByQuestionsClasses = `${css.toggle} ${css.listByQuestions} ${css.disabled}`;
    // For MVP: Added string above to disable button. Uncomment string below when this feature is re-implemented
    // const listByQuestionsClasses = `${css.toggle} ${css.listByQuestions} ${!inQuestionMode ? css.selected : ""}`;
    return (
      <div className={`${css.viewListOption} ${css.columnHeader}`}>View list by:
        <div className={listByStudentClasses} data-cy="list-by-student-toggle" onClick={this.setQuestionMode(false)}>
          <StudentViewIcon className={css.optionIcon} />
        </div>
        {/* For MVP: hard-coded question mode to false so it is never selected. Set to true when selection is implemented */}
        <div className={listByQuestionsClasses} data-cy="list-by-questions-toggle" onClick={this.setQuestionMode(false)}>
          <QuestionViewIcon className={css.optionIcon} />
        </div>
      </div>
    );
  }

  private renderSpotlightToggle() {
    const spotLightContainerClasses = `${css.spotlightContainer} ${this.props.isSpotlightOn ? css.spotlightOn : ""}`;
    return (
      <div className={css.spotlightToggle} onClick={() => this.props.onShowDialog(true)} data-cy="spotlight-toggle">
        <div className={spotLightContainerClasses}>
          <SpotlightIcon className={css.spotlightIcon} />
        </div>
        <span>Spotlight selected</span>
      </div>
    );
  }

  private setQuestionMode = (value: boolean) => () => {
    this.setState({
      inQuestionMode: value
    });
  }

}
