import React from "react";

import ccLogoSrc from "../../../img/cc-logo.png";
import { HeaderMenuContainer } from "./header-menu";
import { AccountOwnerDiv } from "./account-owner";
import { CustomSelect, SelectItem } from "./custom-select";
import AssignmentIcon from "../../../img/svg-icons/assignment-icon.svg";
import DashboardIcon from "../../../img/svg-icons/dashboard-icon.svg";
import GroupIcon from "../../../img/svg-icons/group-icon.svg";
import FeedbackIcon from "../../../img/svg-icons/feedback-icon.svg";
import { ColorTheme, DashboardViewMode } from "../../util/misc";
import { TrackEventFunction } from "../../actions";
import { SORT_BY_NAME } from "../../actions/dashboard";
import { SORT_OPTIONS_CONFIG, SortOption } from "../../reducers/dashboard-reducer";

import css from "../../../css/portal-dashboard/header.less";

interface IProps {
  userName: string;
  assignmentName: string;
  setCompact?: (value: boolean) => void;
  setHideLastRun?: (value: boolean) => void;
  setHideFeedbackBadges?: (value: boolean) => void;
  trackEvent: TrackEventFunction;
  setDashboardViewMode: (mode: DashboardViewMode) => void;
  viewMode: DashboardViewMode;
  colorTheme?: ColorTheme;
  isResearcher: boolean;
  clazzName: string;
  setStudentSort: (sort: SortOption) => void;
  sortByMethod: SortOption;
  compactStudentList?: boolean;
  hideLastRun?: boolean;
  hideFeedbackBadges?: boolean;
}

export class Header extends React.PureComponent<IProps> {
  render() {
    const { colorTheme, userName, setCompact, setHideLastRun, setHideFeedbackBadges, trackEvent,
            isResearcher, clazzName, compactStudentList, hideLastRun, hideFeedbackBadges } = this.props;
    const colorClass = colorTheme ? css[colorTheme] : "";

    return (
      <>
        <div className={`${css.dashboardHeader} ${colorClass}`} data-cy="dashboard-header">
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
            <AccountOwnerDiv userName={userName} colorTheme={colorTheme} />
            <HeaderMenuContainer
              setCompact={setCompact}
              setHideLastRun={setHideLastRun}
              setHideFeedbackBadges={setHideFeedbackBadges}
              colorTheme={colorTheme}
              trackEvent={trackEvent}
              compactStudentList={compactStudentList}
              hideLastRun={hideLastRun}
              hideFeedbackBadges={hideFeedbackBadges}
            />
          </div>
        </div>
        {isResearcher &&
          <div className={css.researcherHeader}>
            <strong>Researcher View</strong> for {clazzName}
          </div>
        }
      </>
    );
  }

  private changeViewMode = (mode: DashboardViewMode) => () => {
    const { setStudentSort, sortByMethod } = this.props;
    const validSortOptions = SORT_OPTIONS_CONFIG[mode === "FeedbackReport" ? "feedback" : "default"];

    if (validSortOptions.indexOf(sortByMethod) === -1) {
      setStudentSort(SORT_BY_NAME);
    }

    this.props.setDashboardViewMode(mode);
    this.props.trackEvent("Portal-Dashboard", "DashboardViewModeDropdownChange", {label: mode});
  }

  private renderNavigationSelect = () => {
    const { trackEvent, viewMode, colorTheme } = this.props;
    const items: SelectItem[] = [{ value: "ProgressDashboard", label: "Progress Dashboard",
                                   icon: DashboardIcon, onSelect: this.changeViewMode("ProgressDashboard") },
                                 { value: "ResponseDetails", label: "Response Details",
                                   icon: GroupIcon, onSelect: this.changeViewMode("ResponseDetails") } ,
                                 { value: "FeedbackReport", label: "Feedback Report", icon: FeedbackIcon,
                                   onSelect: this.changeViewMode("FeedbackReport") }];

    const customSelectColorTheme = colorTheme === "progress"
      ? "progressNavigation"
      : colorTheme === "response" ? "responseNavigation" : "feedbackNavigation";
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
    const customSelectColorTheme = colorTheme === "progress"
      ? "progressAssignment"
      : colorTheme === "response" ? "responseAssignment" : "feedbackAssignment";
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
