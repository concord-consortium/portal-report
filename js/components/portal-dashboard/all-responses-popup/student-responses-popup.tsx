import React from "react";
import { PopupHeader } from "./popup-header";
import { PopupClassNav } from "./popup-class-nav";

import css from "../../../../css/portal-dashboard/all-responses-popup/student-responses-popup.less";

interface IProps {
  handleCloseAllResponsesPopup: (show: boolean) => void;
  studentCount: number;
  setAnonymous: (value: boolean) => void;
  setStudentSort: (value: string) => void;
  trackEvent: (category: string, action: string, label: string) => void;
}
export class StudentResponsePopup extends React.PureComponent<IProps> {
  render() {
    const { studentCount, setAnonymous, setStudentSort, trackEvent } = this.props;
    return (
      <div className={css.popup} >
        <PopupHeader handleCloseAllResponsesPopup={this.props.handleCloseAllResponsesPopup} />
        <div className={css.tableHeader}>
          <PopupClassNav
            studentCount={studentCount}
            setAnonymous={setAnonymous}
            setStudentSort={setStudentSort}
            trackEvent={trackEvent} />
        </div>
      </div>
    );
  }
}
