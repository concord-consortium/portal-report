import React, { PureComponent } from "react";

import css from "../../../css/dashboard/progress-bar.less";

export default class ProgressBar extends PureComponent {
  render() {
    const { progress } = this.props;
    return (
      <div className={css.progressBarCell}>
        <div className={css.progressBar}>
          <div className={`${css.bar} ${progress === 1 ? css.completed : ""}`}
            style={{width: `${progress * 100}%`}} />
        </div>
      </div>
    );
  }
}
