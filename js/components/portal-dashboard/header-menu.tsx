import React from "react";
import MenuIcon from "../../../img/svg-icons/menu-icon.svg";
import CloseIcon from "../../../img/svg-icons/close-icon.svg";
// Removed for MVP:
// import PrintIcon from "../../../img/svg-icons/print-icon.svg";
// import DownloadIcon from "../../../img/svg-icons/download-icon.svg";
import HelpIcon from "../../../img/svg-icons/help-icon.svg";
import { SvgIcon } from "../../util/svg-icon";
import { HeaderMenuItem } from "./header-menu-item";
import { ColorTheme } from "../../util/misc";
import { TrackEventFunction } from "../../actions";

import css from "../../../css/portal-dashboard/header.less";

interface IState {
  showMenuItems: boolean;
  compactStudentList: boolean;
}

interface IProps {
  setCompact?: (value: boolean) => void;
  setHideLastRun?: (value: boolean) => void;
  setHideFeedbackBadges?: (value: boolean) => void;
  colorTheme?: ColorTheme;
  trackEvent: TrackEventFunction;
  compactStudentList?: boolean;
  hideLastRun?: boolean;
  hideFeedbackBadges?: boolean;
}

export interface MenuItemWithState {
  name: string;
  onSelect: (selected: boolean) => void;
  dataCy: string;
  selected: boolean;
}

interface MenuItemWithIcon {
  MenuItemIcon: SvgIcon;
  name: string;
  onSelect: () => void;
  dataCy: string;
  logEvent?: {
    action: string;
  };
}

const items: MenuItemWithIcon[] = [
  {
    MenuItemIcon: HelpIcon,
    name: "Help",
    dataCy: "help-menu-item",
    onSelect: () => {window.open("https://learn.concord.org/teacher-guide");},
    logEvent: {
      action: "OpenHelp"
    }
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
    const { colorTheme } = this.props;
    const colorClass = colorTheme ? css[colorTheme] : "";
    return (
      <div className={css.headerMenu} data-cy="header-menu" onClick={this.handleMenuClick} ref={this.divRef}>
        { this.state.showMenuItems
          ? <CloseIcon className={`${css.icon} ${css.menuIcon} ${colorClass}`} />
          : <MenuIcon className={`${css.icon} ${css.menuIcon} ${colorClass}`} />
        }
        {this.renderMenuItems()}
      </div>
    );
  }

  private renderMenuItems = () => {
    const { colorTheme, trackEvent } = this.props;
    const colorClass = colorTheme ? css[colorTheme] : "";
    const itemsWithState: MenuItemWithState[] = [];
    const setCompact = (value: boolean) => {
      this.props.setCompact?.(value);
      trackEvent("Portal-Dashboard", "CompactStudentList", {label: value.toString()});
    };
    const setHideLastRun = (value: boolean) => {
      this.props.setHideLastRun?.(value);
      trackEvent("Portal-Dashboard", "HideLastRunColumn", {label: value.toString()});
    };
    const setHideFeedbackBadges = (value: boolean) => {
      this.props.setHideFeedbackBadges?.(value);
      trackEvent("Portal-Dashboard", "HideFeedbackBadges", {label: value.toString()});
    };
    this.props.setCompact && itemsWithState.push(
      { name: "Compact student list", onSelect: setCompact, dataCy: "compact-menu-item", selected: !!this.props.compactStudentList });
    this.props.setHideLastRun && itemsWithState.push(
      { name: "Hide Last Run column", onSelect: setHideLastRun, dataCy: "last-run-menu-item", selected: !!this.props.hideLastRun });
    this.props.setHideFeedbackBadges && itemsWithState.push(
      { name: "Hide feedback badges", onSelect: setHideFeedbackBadges, dataCy: "feedback-menu-item", selected: !!this.props.hideFeedbackBadges });
    return (
      <div className={`${css.menuList} ${(this.state.showMenuItems ? css.show : "")}`} data-cy="menu-list">
        <div className={css.topMenu}>
          {itemsWithState && itemsWithState.map((item: MenuItemWithState, i: number) =>
            <HeaderMenuItem key={`item ${i}`} menuItem={item} colorTheme={colorTheme} />
          )}
        </div>
        {items && items.map((item, i) => {
          const onSelect = () => {
            item.onSelect();
            if (item.logEvent) {
              trackEvent("Portal-Dashboard", item.logEvent.action);
            }
          };
          return (
            <div key={`item ${i}`} className={`${css.menuItem} ${colorClass}`} onClick={onSelect}>
              <item.MenuItemIcon className={`${css.menuItemIcon} ${colorClass}`} />
              <div className={css.menuItemName} data-cy={item.dataCy}>{item.name}</div>
            </div>
          );
        })}
      </div>
    );
  }

  private handleMenuClick() {
    this.showMenuItems(!this.state.showMenuItems);
  }

  private handleClick = (e: MouseEvent) => {
    if (this.divRef.current && e.target && !this.divRef.current.contains(e.target as Node)) {
      this.showMenuItems(false);
    }
  }

  private showMenuItems = (value: boolean) => {
    this.setState({ showMenuItems: value });
    // only log when opened
    if (value) {
      this.props.trackEvent("Portal-Dashboard", "ShowHamburgerMenu", {label: value.toString()});
    }
  }

}
