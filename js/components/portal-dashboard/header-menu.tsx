import React from "react";

import css from "../../../css/portal-dashboard/header.less";

interface IState {
  showMenuItems: boolean;
  compactStudentList: boolean;
}

interface IProps {
  setCompact: (value: boolean) => void;
}

// actions are placeholder for future work on what should happen when that menu item is clicked
export interface MenuItemsWithState {
  name: string;
  action: string;
}
export interface MenuItemWithIcon {
  icon: string;
  name: string;
  action: string;
}
export const itemsWithState: MenuItemsWithState[] = [
  {
    name: "Compact student list",
    action: "COMPACT_STUDENT_LIST" }
  ];
export const items: MenuItemWithIcon[] = [
  {
    icon: "#icon-help",
    name: "Help",
    action: "OPEN_HELP"
  },
  {
    icon: "#icon-download",
    name: "Download (.csv)",
    action: "DOWNLOAD_REPORT"
  },
  {
    icon: "#icon-print",
    name: "Print",
    action: "PRINT_REPORT"
  }
];

export class HeaderMenuContainer extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      showMenuItems: false,
      compactStudentList: false
    };
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.handleMenuCompactClick = this.handleMenuCompactClick.bind(this);
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
    return (
      <div className={`${css.menuList} ${(this.state.showMenuItems ? css.show : "")}`}  data-cy="menu-list">
        <div className={`${css.topMenu}`}>
          {itemsWithState && itemsWithState.map((item: any, i: number) => {
            return (
              <div key={`item ${i}`} className={`${css.menuItem}`} onClick={this.handleMenuCompactClick}>
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

  private handleMenuCompactClick() {
    this.props.setCompact(!this.state.compactStudentList);
    this.setState({ compactStudentList: !this.state.compactStudentList });
  }

}
