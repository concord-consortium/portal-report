import React from "react";
import AccountOwnerIcon from "../../../img/svg-icons/account-circle-icon.svg";
import { ColorThemes, getThemeClass } from "../../util/misc";

import css from "../../../css/portal-dashboard/header.less";

interface IProps {
  userName: string;
  colorTheme?: ColorThemes;
}
export class AccountOwnerDiv extends React.PureComponent <IProps> {
  render() {
    return (
      <div className={css.accountOwner} data-cy="account-owner">
        <div className={css.accountOwnerName}>{this.props.userName}</div>
        <AccountOwnerIcon className={`${css.icon} ${getThemeClass(css, this.props.colorTheme)}`} />
      </div>
    );
  }
}
