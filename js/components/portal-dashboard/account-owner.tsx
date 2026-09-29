import React from "react";
import AccountOwnerIcon from "../../../img/svg-icons/account-circle-icon.svg";
import { ColorTheme } from "../../util/misc";

import css from "../../../css/portal-dashboard/header.less";

interface IProps {
  userName: string;
  colorTheme?: ColorTheme;
  divRef?: React.Ref<HTMLDivElement>;
}
export class AccountOwnerDiv extends React.PureComponent <IProps> {
  render() {
    const { colorTheme, userName, divRef } = this.props;
    return (
      <div className={css.accountOwner} data-cy="account-owner" ref={divRef}>
        <AccountOwnerIcon className={`${css.icon} ${colorTheme ? css[colorTheme] : ""}`} />
        <div className={css.accountOwnerName}>{userName}</div>
      </div>
    );
  }
}
