import React from "react";
import { CustomSelect, SelectItem } from "./custom-select";
import { AnonymizeStudents } from "./anonymize-students";
import { Feedback } from "./feedback";
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS } from "../../actions/dashboard";
import { NumberOfStudentsContainer } from "./num-students-container";
import { StudentResponsePopup } from "./student-responses-popup";

import css from "../../../css/portal-dashboard/class-nav.less";

interface IProps {
  clazzName: string;
  setStudentSort: (value: string) => void;
  trackEvent: (category: string, action: string, label: string) => void;
  studentCount: number;
  setAnonymous: (value: boolean) => void;
}

export class ClassNav extends React.PureComponent<IProps> {
  render() {
    const { setAnonymous } = this.props;
    return (
      <div className={css.classNav} data-cy="class-nav">
        { this.renderClassSelect() }
        <AnonymizeStudents setAnonymous={setAnonymous} />
        <Feedback />
        <NumberOfStudentsContainer studentCount={this.props.studentCount} />
        <button onClick={this.renderPopup}>Open Popup</button>
        { this.renderStudentSort() }
      </div>
    );
  }

  private renderClassSelect = () => {
    const { clazzName, trackEvent } = this.props;
    return (
      <div className={css.chooseClass}>
        <CustomSelect
          items={[{action: "", name: clazzName}]}
          onSelectItem={(() => {})}
          trackEvent={trackEvent}
          iconId={"icon-class"}
          dataCy={"choose-class"}
        />
      </div>
    );
  }

  private renderStudentSort = () => {
    const items: SelectItem[] = [{ action: SORT_BY_NAME, name: "Student Name" },
                                 { action: SORT_BY_MOST_PROGRESS, name: "Most Progress" } ,
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

  private renderPopup = () => {
    const { clazzName, setStudentSort, trackEvent, studentCount, setAnonymous } = this.props;
    return (
      <StudentResponsePopup
      clazzName={clazzName}
      setStudentSort={setStudentSort}
      trackEvent={trackEvent}
      studentCount={studentCount}
      setAnonymous={setAnonymous}/>
    );
  }
}
