import React from "react";
import { CustomSelect, SelectItem } from "./custom-select";
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS } from "../../actions/dashboard";

import css from "../../../css/portal-dashboard/class-nav.less";

interface IProps {
  clazzName: string;
  setStudentSort: (value: string) => void;
  trackEvent: (category: string, action: string, label: string) => void;
}

export class ClassNav extends React.PureComponent<IProps> {
  render() {
    const items: SelectItem[] = [{ action: SORT_BY_NAME, name: "Student Name" },
                                 { action: SORT_BY_MOST_PROGRESS, name: "Most Progress" } ,
                                 { action: SORT_BY_LEAST_PROGRESS, name: "Least Progress" }];
    const { clazzName, setStudentSort, trackEvent } = this.props;
    return (
      <div className={css.classNav}>
        class nav for {clazzName}
        <CustomSelect
          items={items}
          onSelectItem={setStudentSort}
          trackEvent={trackEvent}
          iconId={"icon-sort"}
        />
      </div>
    );
  }
}
