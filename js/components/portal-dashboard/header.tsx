import React from "react";

import ccLogoSrc from "../../../img/cc-logo.png";
import { HeaderMenuContainer } from "./header-menu";
import { AccountOwnerDiv } from "./account-owner";
import css from "../../../css/portal-dashboard/header.less";

interface IProps {
  userName: string;
  setCompact: (value: boolean) => void;
}

export class Header extends React.PureComponent <IProps> {
  render() {
    return (
      <div className={css.dashboardHeader} data-cy="dashboard-header">
        <div className={css.appInfo}>
          <img src={ccLogoSrc} className={css.logo} />
          <div className={css.pin} />
          <div className={css.title}>Dashboard</div>
        </div>
        <div className={css.assignment}>Assignment:</div>
        <div className={css.headerRight}>
          <AccountOwnerDiv userName={this.props.userName}/>
          <HeaderMenuContainer setCompact={this.props.setCompact} />
        </div>

      </div>
    );
  }
}
