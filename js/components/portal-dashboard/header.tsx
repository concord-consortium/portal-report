import React from "react";

import ccLogoSrc from "../../../img/cc-logo.png";
import { HeaderMenuContainer } from "./header-menu";
import { AccountOwnerDiv } from "./account-owner";
import css from "../../../css/portal-dashboard/header.less";
import { HeaderMenuContainer } from "./header-menu";
import { AccountOwnerContainer } from "./account-owner";


interface IProps {
  userName: string;
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
          <HeaderMenuContainer />
        </div>

      </div>
    );
  }
}
