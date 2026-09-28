import React from "react";

import ccLogoSrc from "../../../img/cc-logo.png";
import { HeaderMenuContainer } from "./header-menu";
import { AccountOwnerDiv } from "./account-owner";
import { CustomSelect, SelectItem } from "./custom-select";
import AssignmentIcon from "../../../img/svg-icons/assignment-icon.svg";
import DashboardIcon from "../../../img/svg-icons/dashboard-icon.svg";
import GroupIcon from "../../../img/svg-icons/group-icon.svg";
import FeedbackIcon from "../../../img/svg-icons/feedback-icon.svg";
import DownloadIcon from "../../../img/svg-icons/download-icon.svg";
import { ColorTheme, DashboardViewMode } from "../../util/misc";
import { TrackEventFunction } from "../../actions";
import { SORT_BY_NAME } from "../../actions/dashboard";
import { SORT_OPTIONS_CONFIG, SortOption } from "../../reducers/dashboard-reducer";
import { downloadButtonFits, outerBox } from "./download-button-fit";

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
  onDownloadCsv?: () => void;
}

interface IState {
  downloadButtonFits: boolean;
}

export class Header extends React.PureComponent<IProps, IState> {
  state: IState = { downloadButtonFits: true };
  private headerRef = React.createRef<HTMLDivElement>();
  private assignmentRef = React.createRef<HTMLDivElement>();
  private downloadButtonRef = React.createRef<HTMLButtonElement>();
  private ownerRef = React.createRef<HTMLDivElement>();
  private resizeObserver?: ResizeObserver;

  componentDidMount() {
    // jsdom has no ResizeObserver.
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(this.updateDownloadButtonFit);
      // The name and the button can change width without resizing the header, e.g. when the web font loads.
      [this.headerRef, this.ownerRef, this.downloadButtonRef].forEach(ref => {
        if (ref.current) {
          this.resizeObserver?.observe(ref.current);
        }
      });
    }
    this.updateDownloadButtonFit();
  }

  componentDidUpdate(prevProps: IProps) {
    if (prevProps.userName !== this.props.userName || prevProps.assignmentName !== this.props.assignmentName) {
      this.updateDownloadButtonFit();
    }
  }

  componentWillUnmount() {
    this.resizeObserver?.disconnect();
  }

  render() {
    const { colorTheme, userName, setCompact, setHideLastRun, setHideFeedbackBadges, trackEvent,
            isResearcher, clazzName, compactStudentList, hideLastRun, hideFeedbackBadges, onDownloadCsv } = this.props;
    const { downloadButtonFits: buttonFits } = this.state;
    const colorClass = colorTheme ? css[colorTheme] : "";

    return (
      <>
        <div className={`${css.dashboardHeader} ${colorClass}`} data-cy="dashboard-header" ref={this.headerRef}>
          <div className={css.appInfo}>
            <img src={ccLogoSrc} className={css.logo} data-cy="header-logo"/>
            {this.renderNavigationSelect()}
          </div>
          <div className={css.headerCenter}>
            <div className={css.assignmentTitle}>
              Assignment:
            </div>
            <div ref={this.assignmentRef}>
              {this.renderAssignmentSelect()}
            </div>
          </div>
          <div className={css.headerRight}>
            {onDownloadCsv &&
              <button type="button" ref={this.downloadButtonRef} data-cy="download-csv-button" onClick={onDownloadCsv}
                      className={`${css.downloadButton} ${colorClass} ${buttonFits ? "" : css.downloadButtonHidden}`}>
                <DownloadIcon className={`${css.downloadButtonIcon} ${colorClass}`} aria-hidden="true" />
                <span>Download as CSV</span>
              </button>
            }
            <AccountOwnerDiv userName={userName} colorTheme={colorTheme} divRef={this.ownerRef} />
            <HeaderMenuContainer
              setCompact={setCompact}
              setHideLastRun={setHideLastRun}
              setHideFeedbackBadges={setHideFeedbackBadges}
              colorTheme={colorTheme}
              trackEvent={trackEvent}
              compactStudentList={compactStudentList}
              hideLastRun={hideLastRun}
              hideFeedbackBadges={hideFeedbackBadges}
              onDownloadCsv={onDownloadCsv}
              showDownloadCsv={!buttonFits}
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

  private updateDownloadButtonFit = () => {
    const assignment = this.assignmentRef.current;
    const owner = this.ownerRef.current;
    const button = this.downloadButtonRef.current;
    if (!this.props.onDownloadCsv || !assignment || !owner || !button) {
      return;
    }
    const buttonBox = outerBox(button);
    const fits = downloadButtonFits({
      assignmentRight: assignment.getBoundingClientRect().right,
      ownerOuterLeft: outerBox(owner).left,
      buttonOuterWidth: buttonBox.width,
      buttonShown: this.state.downloadButtonFits,
      buttonOuterLeft: buttonBox.left
    });
    if (fits !== this.state.downloadButtonFits) {
      this.setState({ downloadButtonFits: fits });
    }
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
