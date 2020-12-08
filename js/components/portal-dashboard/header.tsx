import React from "react";

import ccLogoSrc from "../../../img/cc-logo.png";
import { HeaderMenuContainer } from "./header-menu";
import { AccountOwnerDiv } from "./account-owner";
import { CustomSelect, SelectItem } from "./custom-select";
import AssignmentIcon from "../../../img/svg-icons/assignment-icon.svg";
import DashboardIcon from "../../../img/svg-icons/dashboard-icon.svg";
import GroupIcon from "../../../img/svg-icons/group-icon.svg";
import FeedbackIcon from "../../../img/svg-icons/feedback-icon.svg";
import { HeaderColorThemes, getThemeClass } from "../../util/misc";
import css from "../../../css/portal-dashboard/header.less";

interface IProps {
  userName: string;
  assignmentName: string;
  setCompact: (value: boolean) => void;
  setShowFeedbackBadges: (value: boolean) => void;
  trackEvent: (category: string, action: string, label: string) => void;
  handleShowAllResponsesPopup: (show: boolean) => void;
  colorTheme?: HeaderColorThemes;
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

  private showAllResponses = (show: boolean) => () => {
    const { handleShowAllResponsesPopup } = this.props;
    handleShowAllResponsesPopup(show);
  }

  private renderNavigationSelect = () => {
    const { trackEvent } = this.props;
    const items: SelectItem[] = [{ value: "Progress_Dash", label: "Progress Dashboard", icon: DashboardIcon, onSelect: this.showAllResponses(false) },
                                 { value: "Response_Details", label: "Response Details", icon: GroupIcon, onSelect: this.showAllResponses(true) } ,
                                 { value: "Feedback_Report", label: "Feedback Report", icon: FeedbackIcon, onSelect: this.showAllResponses(true) }];
    return (
      <CustomSelect
        items={items}
        trackEvent={trackEvent}
        dataCy={"navigation-select"}
        width={212}
      />
    );
  }

  private renderAssignmentSelect = () => {
    const { assignmentName, trackEvent } = this.props;
    return (
      <CustomSelect
        items={[{ value: "", label: assignmentName }]}
        trackEvent={trackEvent}
        HeaderIcon={AssignmentIcon}
        dataCy={"choose-assignment"}
        isHeader={true}
        disableDropdown={true}
        width={280}
      />
    );
  }
}
