import React from "react";
import { PopupHeader } from "./popup-header";

import css from "../../../../css/portal-dashboard/all-responses-popup/student-responses-popup.less";

export class StudentResponsePopup extends React.PureComponent {
    render() {
        return (
            <div className={css.popup} >
                <PopupHeader />
            </div>
        );
    }
}
