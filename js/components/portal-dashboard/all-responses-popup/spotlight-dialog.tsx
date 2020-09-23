import React from "react";
import SpotlightIcon from "../../../../img/svg-icons/spotlight-icon.svg";

import css from "../../../../css/portal-dashboard/all-responses-popup/spotlight-dialog.less";

interface IProps {
  onCloseDialog: () => void;
}
export class NoStudentSelectedSpotlightDialog extends React.PureComponent<IProps>{
  render() {
    return (
      <div className={css.dialog} data-cy="spotlight-dialog">
        <div className={css.dialogWrapper}>
          <div className={css.dialogTitleWrapper}>
            <div>
              <SpotlightIcon className={css.spotlightIcon} />
            </div>
            <div className={css.dialogTitle}>
              Spotlight selected student work
            </div>
          </div>
          <div className={css.dialogText}>
            Select one or more students to view and/or compare their answers.
          </div>
          <div className={css.dialogText}>
            Use this feature to highlight and share student work in your classroom.
          </div>
          <div className={css.dismissDialogButton} onClick={this.props.onCloseDialog} data-cy="spotlight-dialog-close-button">
            Got it
          </div>
        </div>
      </div>
    );
  }
}
