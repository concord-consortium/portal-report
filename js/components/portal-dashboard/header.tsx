import React from "react";

import ccLogoSrc from "../../../img/cc-logo.png";
import { HeaderMenuContainer } from "./header-menu";
import { AccountOwnerDiv } from "./account-owner";
import { CustomSelect } from "./custom-select";
import css from "../../../css/portal-dashboard/header.less";

interface IProps {
  userName: string;
  sequenceName: string;
  setCompact: (value: boolean) => void;
  trackEvent: (category: string, action: string, label: string) => void;
}

export class Header extends React.PureComponent<IProps> {
  render() {
    return (
      <div className={css.dashboardHeader} data-cy="dashboard-header">
        <div className={css.appInfo}>
          <img src={ccLogoSrc} className={css.logo} />
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
    const { sequenceName, trackEvent } = this.props;
    return (
      <div className={`${css.customSelect}`}>
        <CustomSelect
          items={[{ action: "", name: sequenceName }]}
          onSelectItem={(() => { })}
          trackEvent={trackEvent}
          iconId={"icon-assignment"}
          dataCy={"choose-assignment"}
        />
      </div>
    );
  }
}
