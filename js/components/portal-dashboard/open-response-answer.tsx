import React from "react";

import css from "../../../css/portal-dashboard/answer.less";

export class OpenResponseAnswer extends React.PureComponent {
  render() {
    return (
      <div className={css.answer}>
        <svg className={css.icon}>
          <use xlinkHref="#open-response-complete" />
        </svg>
      </div>
    );
  }
}
