import React from "react";
import MenuIcon from "../../../img/svg-icons/menu-icon.svg";
import CloseIcon from "../../../img/svg-icons/close-icon.svg";
import PrintIcon from "../../../img/svg-icons/print-icon.svg";
import DownloadIcon from "../../../img/svg-icons/download-icon.svg";
import HelpIcon from "../../../img/svg-icons/help-icon.svg";
import CheckIcon from "../../../img/svg-icons/check-icon.svg";
import { SvgIcon } from "../../util/misc";

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
  dataCy: string;
}
export interface MenuItemWithIcon {
  MenuItemIcon: SvgIcon;
  name: string;
  action: string;
}
export const itemsWithState: MenuItemsWithState[] = [
  {
    name: "Compact student list",
    action: "COMPACT_STUDENT_LIST",
    dataCy: "compact-menu-item"
  }
];
export const items: MenuItemWithIcon[] = [
  {
    MenuItemIcon: HelpIcon,
    name: "Help",
    action: "OPEN_HELP"
  },
  {
    MenuItemIcon: DownloadIcon,
    name: "Download (.csv)",
    action: "DOWNLOAD_REPORT"
  },
  {
    MenuItemIcon: PrintIcon,
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
        { this.state.showMenuItems
          ? <CloseIcon className={`${css.icon} ${css.menuIcon}`} />
          : <MenuIcon className={`${css.icon} ${css.menuIcon}`} />
        }
        {this.renderMenuItems()}
      </div>
    );
  }

  private renderMenuItems = () => {
    return (
      <div className={`${css.menuList} ${(this.state.showMenuItems ? css.show : "")}`} data-cy="menu-list">
        <div className={`${css.topMenu}`}>
          {itemsWithState && itemsWithState.map((item: MenuItemsWithState, i: number) => {
            return (
              <div key={`item ${i}`} className={`${css.menuItem}`} onClick={this.handleMenuCompactClick} data-cy={item.dataCy}>
                { <CheckIcon className={`${css.check} ${this.state.compactStudentList ? css.selected : ""}`} /> }
                <div className={`${css.menuItemName}`}>{item.name}</div>
              </div>
            );
          })}
        </div>
        {items && items.map((item, i) => {
          return (
            <div key={`item ${i}`} className={`${css.menuItem}`}>
              <item.MenuItemIcon className={css.menuItemIcon} />
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
