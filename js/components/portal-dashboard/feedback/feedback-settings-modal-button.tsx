import React, { PureComponent } from "react";

import css from "../../../../css/portal-dashboard/feedback/feedback-settings-modal-button.less";

interface IProps {
  selected: boolean;
  label: string;
  value: number;
  onClick: (newValue: number) => void;
  children?: React.ReactNode;
}

export class FeedbackSettingsModalButton extends PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    return (
      <div className={css.feedbackSettingsModalButton}>
        <div className={css.modalButton}>
          <button className={css.outerCircle} data-cy="feedback-settings-radio-button" onClick={this.handleOnClick}>
            <div className={`${css.innerCircle} ${this.props.selected ? css.selected : ""}`}></div>
          </button>
        </div>
        <div className={css.modalButtonLabel}>{this.props.label}</div>
        {this.props.children}
      </div>
    );
  }

  private handleOnClick = () => {
    this.props.onClick(this.props.value);
  }

}
