import React from "react";
import AccountOwnerIcon from "../../../img/svg-icons/account-circle-icon.svg";
import { ColorTheme } from "../../util/misc";

import css from "../../../css/portal-dashboard/header.less";

interface IProps {
  userName: string;
  colorTheme?: ColorTheme;
}
export class AccountOwnerDiv extends React.PureComponent <IProps> {
  render() {
    const { colorTheme, userName } = this.props;
    return (
      <div className={css.accountOwner} data-cy="account-owner">
        <AccountOwnerIcon className={`${css.icon} ${colorTheme ? css[colorTheme] : ""}`} />
        <div className={css.accountOwnerName}>{userName}</div>
      </div>
    );
  }
}
