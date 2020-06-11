/* eslint-disable no-console */
import React from "react";
import { PopupHeader } from "./popup-header";

import css from "../../../../css/portal-dashboard/all-responses-popup/student-responses-popup.less";

interface IProps {
    currentActivity: any;
}
interface IState {
    isOpen: boolean;
}

export class StudentResponsePopup extends React.PureComponent<IProps,IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isOpen: false
        };
    }
    render() {
        const { currentActivity } = this.props;
        let popupClass: any;

        this.state.isOpen? popupClass+=" "+css.open: popupClass=css.popup;
        return (
            <div className={popupClass} >
                <PopupHeader activityName={currentActivity} />
            </div>
        );
    }
}
