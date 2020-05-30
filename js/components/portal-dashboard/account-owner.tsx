import React from "react";

import css from "../../../css/portal-dashboard/header.less";

export class AccountOwnerContainer extends React.PureComponent {
    render() {
        return (
            <div className={css.accountOwner} data-cy="account-owner">
                <div className={css.accountOwnerName}>Kristen Teachername</div>
                <div className={css.accountOwnerIcon}>
                    {this.renderIcon(`${css.icon}`, "#icon-account-owner")}
                </div>
            </div>
        );
    }
    private renderIcon = (cssClass: string, iconId: string) => {
        return (
            <svg className={cssClass}>
                <use xlinkHref={iconId} />
            </svg>
        );
    }
}
