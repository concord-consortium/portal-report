import React from "react";
import { CustomSelect, SelectItem } from "./custom-select";
import { AnonymizeStudents } from "./anonymize-students";
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS } from "../../actions/dashboard";
import { CountContainer } from "./count-container";
import { DashboardViewMode } from "../../util/misc";
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
  viewMode: DashboardViewMode;
}

export class ClassNav extends React.PureComponent<IProps> {
  render() {
    const { anonymous, setAnonymous, studentCount } = this.props;

    return (
      <div className={css.classNav} data-cy="class-nav">
        { this.renderClassSelect() }
        <AnonymizeStudents anonymous={anonymous} setAnonymous={setAnonymous} />
        <CountContainer numItems={studentCount} containerLabel={"Class: "} containerLabelType={"students"} />
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
          items={[{value: "", label: clazzName}]}
          trackEvent={trackEvent}
        />
      </div>
    );
  }

  private handleStudentSortSelect = (value: string) => () => {
    const { setStudentSort } = this.props;
    setStudentSort(value);
  }

  private renderStudentSort = () => {
    const { sortByMethod, trackEvent } = this.props;
    const items: SelectItem[] = [{ value: SORT_BY_NAME, label: "Student Name",
                                   onSelect: this.handleStudentSortSelect(SORT_BY_NAME) },
                                 { value: SORT_BY_MOST_PROGRESS, label: "Most Progress",
                                   onSelect: this.handleStudentSortSelect(SORT_BY_MOST_PROGRESS) },
                                 { value: SORT_BY_LEAST_PROGRESS, label: "Least Progress",
                                   onSelect: this.handleStudentSortSelect(SORT_BY_LEAST_PROGRESS) }];
    return (
      <div className={css.itemSort}>
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
}
