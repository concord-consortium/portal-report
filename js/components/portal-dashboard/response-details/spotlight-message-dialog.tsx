import React from "react";
import SpotlightIcon from "../../../../img/svg-icons/spotlight-icon.svg";

import css from "../../../../css/portal-dashboard/response-details/spotlight-message-dialog.less";

interface IProps {
  onCloseDialog: (show: boolean) => void;
}
export class SpotlightMessageDialog extends React.PureComponent<IProps>{
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
          <div className={css.dismissDialogButton} onClick={() => this.props.onCloseDialog(false)} data-cy="spotlight-dialog-close-button">
            Got it
          </div>
        </div>
      </div>
    );
  }
}
