import React from "react";

import ccLogoSrc from "../../../img/cc-logo.png";
import { HeaderMenuContainer } from "./header-menu";
import { AccountOwnerDiv } from "./account-owner";
import { CustomSelect } from "./custom-select";
import AssignmentIcon from "../../../img/svg-icons/assignment-icon.svg";
import css from "../../../css/portal-dashboard/header.less";

interface IProps {
  userName: string;
  assignmentName: string;
  setCompact: (value: boolean) => void;
  trackEvent: (category: string, action: string, label: string) => void;
}

export class Header extends React.PureComponent<IProps> {
  render() {
    return (
      <div className={css.dashboardHeader} data-cy="dashboard-header">
        <div className={css.appInfo}>
          <img src={ccLogoSrc} className={css.logo} data-cy="header-logo"/>
          <div className={css.pin} />
          <div className={css.title}>Dashboard</div>
        </div>
        <div className={css.headerCenter}>
          <div className={css.assignmentTitle}>
            Assignment:
          </div>
          {this.renderAssignmentSelect()}
        </div>
        <div className={css.headerRight}>
          <AccountOwnerDiv userName={this.props.userName} />
          <HeaderMenuContainer setCompact={this.props.setCompact} />
        </div>
      </div>
    );
  }

  private renderAssignmentSelect = () => {
    const { assignmentName, trackEvent } = this.props;
    return (
        <CustomSelect
          items={[{ action: "", name: assignmentName }]}
          onSelectItem={(() => { })}
          trackEvent={trackEvent}
          HeaderIcon={AssignmentIcon}
          dataCy={"choose-assignment"}
          isHeader={true}
          disableDropdown={true}
        />
    );
  }
}
