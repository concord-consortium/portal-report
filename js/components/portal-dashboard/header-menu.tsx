import React from "react";
import MenuIcon from "../../../img/svg-icons/menu-icon.svg";
import CloseIcon from "../../../img/svg-icons/close-icon.svg";
// Removed for MVP:
// import PrintIcon from "../../../img/svg-icons/print-icon.svg";
// import DownloadIcon from "../../../img/svg-icons/download-icon.svg";
import HelpIcon from "../../../img/svg-icons/help-icon.svg";
import { SvgIcon } from "../../util/svg-icon";
import { HeaderMenuItem } from "./header-menu-item";
import { ColorThemes, getThemeClass } from "../../util/misc";

import css from "../../../css/portal-dashboard/header.less";

interface IState {
  showMenuItems: boolean;
  compactStudentList: boolean;
}

interface IProps {
  setCompact: (value: boolean) => void;
  setShowFeedbackBadges: (value: boolean) => void;
  colorTheme?: ColorThemes;
}

export interface MenuItemWithState {
  name: string;
  onSelect: (selected: boolean) => void;
  dataCy: string;
}

interface MenuItemWithIcon {
  MenuItemIcon: SvgIcon;
  name: string;
  onSelect: () => void;
  dataCy: string;
}

const items: MenuItemWithIcon[] = [
  {
    MenuItemIcon: HelpIcon,
    name: "Help",
    dataCy: "help-menu-item",
    onSelect: () => {window.open("https://docs.google.com/document/d/1C_6hiZzdSF_p6edhJeY_q_SvulFEPlawo7OKSaF7E88/edit?usp=sharing");}
  },
  // Removed for MVP:
  /*
  {
    MenuItemIcon: DownloadIcon,
    name: "Download (.csv)",
    dataCy: "download-menu-item",
    action: "DOWNLOAD_REPORT"
  },
  {
    MenuItemIcon: PrintIcon,
    name: "Print",
    dataCy: "print-menu-item",
    action: "PRINT_REPORT"
  }
  */
];

export class HeaderMenuContainer extends React.PureComponent<IProps, IState> {
  private divRef = React.createRef<HTMLDivElement>();
  constructor(props: IProps) {
    super(props);
    this.state = {
      showMenuItems: false,
      compactStudentList: false
    };
    this.handleMenuClick = this.handleMenuClick.bind(this);
  }

  public componentDidMount() {
    document.addEventListener("mousedown", this.handleClick, false);
  }

  public componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClick, false);
  }

  render() {
    return (
      <div className={css.headerMenu} data-cy="header-menu" onClick={this.handleMenuClick} ref={this.divRef}>
        { this.state.showMenuItems
          ? <CloseIcon className={`${css.icon} ${css.menuIcon} ${getThemeClass(css, this.props.colorTheme)}`} />
          : <MenuIcon className={`${css.icon} ${css.menuIcon} ${getThemeClass(css, this.props.colorTheme)}`} />
        }
        {this.renderMenuItems()}
      </div>
    );
  }

  private renderMenuItems = () => {
    const itemsWithState: MenuItemWithState[] = [
      {
        name: "Compact student list",
        onSelect: this.props.setCompact,
        dataCy: "compact-menu-item"
      },
      // TODO: FEEDBACK
      /*
      {
        name: "Show feedback badges",
        onSelect: this.props.setShowFeedbackBadges,
        dataCy: "feedback-menu-item"
      },
      */
    ];
    return (
      <div className={`${css.menuList} ${(this.state.showMenuItems ? css.show : "")}`} data-cy="menu-list">
        <div className={css.topMenu}>
          {itemsWithState && itemsWithState.map((item: MenuItemWithState, i: number) => {
            return (
              <HeaderMenuItem key={`item ${i}`} menuItem={item} colorTheme={this.props.colorTheme} />
            );
          })}
        </div>
        {items && items.map((item, i) => {
          return (
            <div key={`item ${i}`} className={`${css.menuItem} ${getThemeClass(css, this.props.colorTheme)}`} onClick={item.onSelect}>
              <item.MenuItemIcon className={`${css.menuItemIcon} ${getThemeClass(css, this.props.colorTheme)}`} />
              <div className={css.menuItemName} data-cy={item.dataCy}>{item.name}</div>
            </div>
          );
        })}
      </div>
    );
  }

  private handleMenuClick() {
    this.setState({ showMenuItems: !this.state.showMenuItems });
  }

  private handleClick = (e: MouseEvent) => {
    if (this.divRef.current && e.target && !this.divRef.current.contains(e.target as Node)) {
      this.setState({ showMenuItems: false });
    }
  }

}
