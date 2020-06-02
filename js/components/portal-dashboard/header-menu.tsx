import React from "react";

import css from "../../../css/portal-dashboard/header.less";

interface IState {
  showMenuItems: boolean;
  compactStudentList: boolean;
}
export interface MenuItemsWithState {
  name: string;
}
export interface MenuItemWithIcon {
  icon: string;
  name: string;
}
export const itemsWithState: MenuItemsWithState[] = [
  { name: "Compact student list" }
];
export const items: MenuItemWithIcon[] = [
  { icon: "#icon-help", name: "Help" },
  { icon: "#icon-download", name: "Download (.csv)" },
  { icon: "#icon-print", name: "Print" }
];

export class HeaderMenuContainer extends React.PureComponent<{}, IState> {
  constructor() {
    super({});
    this.state = {
      showMenuItems: false,
      compactStudentList: false
    };
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.handleMenuItemClick = this.handleMenuItemClick.bind(this);
  }

  render() {
    return (
      <div className={css.headerMenu} data-cy="header-menu" onClick={this.handleMenuClick}>
        {this.renderMenuIcon()}
        {this.renderMenuItems()}
        {/* <div className={css.hamBurger}></div> */}
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

  private renderMenuIcon = () => {
    return (
      <div>
        {this.state.showMenuItems ? this.renderIcon(`${css.icon} ${css.menuIcon}`, "#icon-close-menu") : this.renderIcon(`${css.icon} ${css.menuIcon}`, "#icon-menu")}
      </div>
    );
  }

  private renderMenuItems = () => {
    // eslint-disable-next-line no-console
    console.log("showMenuItems state: ", this.state.showMenuItems);
    // eslint-disable-next-line no-console
    console.log("compactStudentList state: ", this.state.compactStudentList);
    return (
      <div className={`${css.menuList} ${(this.state.showMenuItems ? css.show : "")}`} onClick={this.handleMenuItemClick}  data-cy="menu-list">
        <div className={`${css.topMenu}`}>
          {itemsWithState && itemsWithState.map((item: any, i: number) => {
            return (
              <div key={`item ${i}`} className={`${css.menuItem}`}>
                <div>
                {this.state.compactStudentList ? this.renderIcon(`${css.check} ${css.selected}`, "#icon-check") : this.renderIcon(`${css.check}`, "#icon-check")}
                </div>
                <div className={`${css.menuItemName}`}>{item.name}</div>
              </div>
            );
          })}
        </div>
        {items && items.map((item: any, i: number) => {
          return (
            <div key={`item ${i}`} className={`${css.menuItem}`}>
              {this.renderIcon(`${css.menuItemIcon}`, item.icon)}
              <div className={`${css.menuItemName}`}>{item.name}</div>
            </div>
          );
        })}
      </div>
    );
  }

  private handleMenuClick() {
    this.setState({ showMenuItems: !this.state.showMenuItems });
  }

  private handleMenuItemClick() {
    this.setState({ compactStudentList: !this.state.compactStudentList });
  }

}
