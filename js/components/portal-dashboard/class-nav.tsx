import React from "react";
import { CustomSelect, SelectItem } from "./custom-select";
import { AnonymizeStudents } from "./anonymize-students";
import { Feedback } from "./feedback";
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS } from "../../actions/dashboard";

import css from "../../../css/portal-dashboard/class-nav.less";
import { NumberOfStudentsContainer } from "./num-students-container";

interface IProps {
  clazzName: string;
  setStudentSort: (value: string) => void;
  trackEvent: (category: string, action: string, label: string) => void;
  studentCount: number;
  setAnonymous: (value: boolean) => void;
}

export class ClassNav extends React.PureComponent<IProps> {
  render() {
    const items: SelectItem[] = [{ action: SORT_BY_NAME, name: "Student Name" },
                                 { action: SORT_BY_MOST_PROGRESS, name: "Most Progress" } ,
                                 { action: SORT_BY_LEAST_PROGRESS, name: "Least Progress" }];
    const { clazzName, setStudentSort, trackEvent, setAnonymous } = this.props;
    return (
      <div className={css.classNav} data-cy="class-nav">
        <div className={css.title}>{clazzName}</div>
        <AnonymizeStudents setAnonymous={setAnonymous} />
        <Feedback />
        <NumberOfStudentsContainer studentCount={this.props.studentCount} />
        <div className={css.studentSort}>
          <CustomSelect
            items={items}
            onSelectItem={setStudentSort}
            trackEvent={trackEvent}
            iconId={"icon-sort"}
            dataCy={"sort-students"}
          />
        </div>
      </div>
    );
  }
}
