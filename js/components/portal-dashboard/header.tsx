import React from "react";

import ccLogoSrc from "../../../img/cc-logo.png";
import css from "../../../css/portal-dashboard/header.less";

export class Header extends React.PureComponent {
  render() {
    return (
      <div className={css.dashboardHeader} data-test="dashboard-header">
        <div className={css.appInfo}>
          <img src={ccLogoSrc} className={css.logo} />
          <div className={css.pin}/>
          <div className={css.title}>Dashboard</div>
        </div>
        <div className={css.assignment}>Assignment:</div>
        <div className={css.login}>User Login</div>
      </div>
    );
  }
}
