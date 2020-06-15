import React from "react";
import { PopupHeader } from "./popup-header";

import css from "../../../../css/portal-dashboard/all-responses-popup/student-responses-popup.less";

interface IProps {
  handleCloseAllResponsesPopup: (show: boolean) => void;
}
export class StudentResponsePopup extends React.PureComponent<IProps> {
  render() {
    return (
      <div className={css.popup} >
        <PopupHeader handleCloseAllResponsesPopup={this.props.handleCloseAllResponsesPopup} />
      </div>
    );
  }
}
