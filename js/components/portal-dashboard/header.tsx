import React from "react";

import ccLogoSrc from "../../../img/cc-logo.png";
import { HeaderMenuContainer } from "./header-menu";
import { AccountOwnerDiv } from "./account-owner";
import { CustomSelect, SelectItem } from "./custom-select";
import AssignmentIcon from "../../../img/svg-icons/assignment-icon.svg";
import DashboardIcon from "../../../img/svg-icons/dashboard-icon.svg";
import GroupIcon from "../../../img/svg-icons/group-icon.svg";
import FeedbackIcon from "../../../img/svg-icons/feedback-icon.svg";
import { ColorThemes, getThemeClass, DashboardViewMode } from "../../util/misc";
import css from "../../../css/portal-dashboard/header.less";

interface IProps {
  userName: string;
  assignmentName: string;
  setCompact: (value: boolean) => void;
  setShowFeedbackBadges: (value: boolean) => void;
  trackEvent: (category: string, action: string, label: string) => void;
  handleChangeViewMode: (mode: DashboardViewMode) => void;
  viewMode: DashboardViewMode;
  colorTheme?: ColorThemes;
}

export class Header extends React.PureComponent<IProps> {
  render() {
    return (
      <div className={`${css.dashboardHeader} ${getThemeClass(css, this.props.colorTheme)}`} data-cy="dashboard-header">
        <div className={css.appInfo}>
          <img src={ccLogoSrc} className={css.logo} data-cy="header-logo"/>
          {this.renderNavigationSelect()}
        </div>
        <div className={css.headerCenter}>
          <div className={css.assignmentTitle}>
            Assignment:
          </div>
          {this.renderAssignmentSelect()}
        </div>
        <div className={css.headerRight}>
          <AccountOwnerDiv userName={this.props.userName} colorTheme={this.props.colorTheme} />
          <HeaderMenuContainer
            setCompact={this.props.setCompact}
            setShowFeedbackBadges={this.props.setShowFeedbackBadges}
            colorTheme={this.props.colorTheme}
          />
        </div>
      </div>
    );
  }

  private changeViewMode = (mode: DashboardViewMode) => () => {
    const { handleChangeViewMode } = this.props;
    handleChangeViewMode(mode);
  }

  private renderNavigationSelect = () => {
    const { trackEvent, viewMode, colorTheme } = this.props;
    const items: SelectItem[] = [{ value: "ProgressDashboard", label: "Progress Dashboard", icon: DashboardIcon, onSelect: this.changeViewMode("ProgressDashboard") },
                                 { value: "ResponseDetails", label: "Response Details", icon: GroupIcon, onSelect: this.changeViewMode("ResponseDetails") } ,
                                 { value: "FeedbackReport", label: "Feedback Report", icon: FeedbackIcon, onSelect: this.changeViewMode("FeedbackReport") }];

    const customSelectColorTheme = colorTheme === ColorThemes.Progress
      ? ColorThemes.ProgressNavigation
      : colorTheme === ColorThemes.Response ? ColorThemes.ResponseNavigation : ColorThemes.FeedbackNavigation;
    return (
      <CustomSelect
        items={items}
        trackEvent={trackEvent}
        dataCy={"navigation-select"}
        width={212}
        value={viewMode}
        colorTheme={customSelectColorTheme}
      />
    );
  }

  private renderAssignmentSelect = () => {
    const { assignmentName, trackEvent, colorTheme } = this.props;
    const customSelectColorTheme = colorTheme === ColorThemes.Progress
      ? ColorThemes.ProgressAssignment
      : colorTheme === ColorThemes.Response ? ColorThemes.ResponseAssignment : ColorThemes.FeedbackAssignment;
    return (
      <CustomSelect
        items={[{ value: "", label: assignmentName }]}
        trackEvent={trackEvent}
        HeaderIcon={AssignmentIcon}
        dataCy={"choose-assignment"}
        disableDropdown={true}
        width={280}
        colorTheme={customSelectColorTheme}
      />
    );
  }
}
