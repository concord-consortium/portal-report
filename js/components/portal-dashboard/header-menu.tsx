import React from "react";

import css from "../../../css/portal-dashboard/header.less";

interface IProps {
  iconId: string;
}

export class HeaderMenuContainer extends React.PureComponent {
  render() {
    return (
      <div className={css.headerMenu} data-cy="header-menu" onClick={this.handleMenuClick}>
        {this.renderIcon(`${css.icon} ${css.menuIcon}`, "#icon-menu")}
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

  private handleMenuClick = () => {
    // eslint-disable-next-line no-console
    console.log('menu was clicked');
  }
}
