import React from "react";
import { CustomSelect, SelectItem } from "./custom-select";
import { AnonymizeStudents } from "./anonymize-students";
// Removed for MVP: import { Feedback } from "./feedback";
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS } from "../../actions/dashboard";
import { NumberOfStudentsContainer } from "./num-students-container";
import SortIcon from "../../../img/svg-icons/sort-icon.svg";
import ClassIcon from "../../../img/svg-icons/class-icon.svg";

import css from "../../../css/portal-dashboard/class-nav.less";

interface IProps {
  anonymous: boolean;
  clazzName: string;
  setAnonymous: (value: boolean) => void;
  setStudentSort: (value: string) => void;
  sortByMethod: string;
  studentCount: number;
  trackEvent: (category: string, action: string, label: string) => void;
}

export class ClassNav extends React.PureComponent<IProps> {
  render() {
    const { anonymous, setAnonymous } = this.props;
    return (
      <div className={css.classNav} data-cy="class-nav">
        { this.renderClassSelect() }
        <AnonymizeStudents anonymous={anonymous} setAnonymous={setAnonymous} />
        {/* Removed for MVP: <Feedback /> */}
        <NumberOfStudentsContainer studentCount={this.props.studentCount} />
        { this.renderStudentSort() }
      </div>
    );
  }

  private renderClassSelect = () => {
    const { clazzName, trackEvent } = this.props;
    return (
      <div className={css.chooseClass}>
        <CustomSelect
          dataCy={"choose-class"}
          disableDropdown={true}
          HeaderIcon={ClassIcon}
          items={[{action: "", name: clazzName}]}
          onSelectItem={(() => {})}
          trackEvent={trackEvent}
        />
      </div>
    );
  }

  private renderStudentSort = () => {
    const items: SelectItem[] = [{ action: SORT_BY_NAME, name: "Student Name" },
                                 { action: SORT_BY_MOST_PROGRESS, name: "Most Progress" } ,
                                 { action: SORT_BY_LEAST_PROGRESS, name: "Least Progress" }];
    const { setStudentSort, sortByMethod, trackEvent } = this.props;
    return (
      <div className={css.studentSort}>
        <CustomSelect
          dataCy={"sort-students"}
          HeaderIcon={SortIcon}
          items={items}
          onSelectItem={setStudentSort}
          selectState={sortByMethod}
          trackEvent={trackEvent}
        />
      </div>
    );
  }
}
