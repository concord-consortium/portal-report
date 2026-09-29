import React from "react";
import MenuIcon from "../../../img/svg-icons/menu-icon.svg";
import CloseIcon from "../../../img/svg-icons/close-icon.svg";
// Removed for MVP:
// import PrintIcon from "../../../img/svg-icons/print-icon.svg";
import DownloadIcon from "../../../img/svg-icons/download-icon.svg";
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
  onDownloadCsv?: () => void;
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

const helpItem: MenuItemWithIcon = {
  MenuItemIcon: HelpIcon,
  name: "Help",
  dataCy: "help-menu-item",
  onSelect: () => {window.open("https://learn.concord.org/teacher-guide");},
  logEvent: {
    action: "OpenHelp"
  }
};

// Removed for MVP:
/*
{
  MenuItemIcon: PrintIcon,
  name: "Print",
  dataCy: "print-menu-item",
  action: "PRINT_REPORT"
}
*/

export class HeaderMenuContainer extends React.PureComponent<IProps, IState> {
  private divRef = React.createRef<HTMLDivElement>();
  private toggleRef = React.createRef<HTMLButtonElement>();
  private menuListRef = React.createRef<HTMLDivElement>();
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
    const { showMenuItems } = this.state;
    const colorClass = colorTheme ? css[colorTheme] : "";
    return (
      <div className={css.headerMenu} data-cy="header-menu" onClick={this.handleMenuClick} onKeyDown={this.handleKeyDown}
           ref={this.divRef}>
        <button type="button" className={css.menuButton} aria-label="Menu" aria-expanded={showMenuItems}
                data-cy="header-menu-button" ref={this.toggleRef}>
          { showMenuItems
            ? <CloseIcon className={`${css.icon} ${css.menuIcon} ${colorClass}`} aria-hidden="true" />
            : <MenuIcon className={`${css.icon} ${css.menuIcon} ${colorClass}`} aria-hidden="true" />
          }
        </button>
        {this.renderMenuItems()}
      </div>
    );
  }

  private getIconItems(): MenuItemWithIcon[] {
    const { onDownloadCsv } = this.props;
    // The download thunk logs its own event, so this item has no logEvent.
    const downloadItem: MenuItemWithIcon[] = onDownloadCsv
      ? [{ MenuItemIcon: DownloadIcon, name: "Download as CSV", dataCy: "download-csv-menu-item", onSelect: onDownloadCsv }]
      : [];
    return [...downloadItem, helpItem];
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
      <div className={`${css.menuList} ${(this.state.showMenuItems ? css.show : "")}`} data-cy="menu-list"
           aria-hidden={!this.state.showMenuItems} ref={this.menuListRef}>
        <div className={css.topMenu}>
          {itemsWithState && itemsWithState.map((item: MenuItemWithState, i: number) =>
            <HeaderMenuItem key={`item ${i}`} menuItem={item} colorTheme={colorTheme} />
          )}
        </div>
        {this.getIconItems().map((item, i) => {
          const onSelect = () => {
            item.onSelect();
            if (item.logEvent) {
              trackEvent("Portal-Dashboard", item.logEvent.action);
            }
          };
          return (
            // The list stays in the DOM while closed (it fades out), so its items leave the tab order then.
            <button type="button" key={`item ${i}`} className={`${css.menuItem} ${colorClass}`} onClick={onSelect}
                    tabIndex={this.state.showMenuItems ? 0 : -1}>
              <item.MenuItemIcon className={`${css.menuItemIcon} ${colorClass}`} aria-hidden="true" />
              <div className={css.menuItemName} data-cy={item.dataCy}>{item.name}</div>
            </button>
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

  private handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && this.state.showMenuItems) {
      this.showMenuItems(false);
    }
  }

  private showMenuItems = (value: boolean) => {
    // Focus inside the closing list would be left on a hidden item, so return it to the toggle.
    if (!value && this.menuListRef.current?.contains(document.activeElement)) {
      this.toggleRef.current?.focus();
    }
    this.setState({ showMenuItems: value });
    // only log when opened
    if (value) {
      this.props.trackEvent("Portal-Dashboard", "ShowHamburgerMenu", {label: value.toString()});
    }
  }

}
