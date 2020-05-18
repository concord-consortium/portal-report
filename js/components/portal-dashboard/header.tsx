import * as React from "react";

import ccLogoSrc from "../../../img/cc-logo.png";
import css from "../../../css/portal-dashboard/header.less";

export class Header extends React.PureComponent {
  render() {
    return (
      <div className={css.dashboardHeader}>
        <img src={ccLogoSrc} className={css.logo} />
        <div className={css.title}>dashboard</div>
        <div className={css.assignment}>assignment selection</div>
        <div className={css.login}>login area</div>
      </div>
    );
  }
}
