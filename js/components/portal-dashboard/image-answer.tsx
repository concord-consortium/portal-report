import React from "react";

import css from "../../../css/portal-dashboard/answer.less";

export class ImageAnswer extends React.PureComponent {
  render() {
    return (
      <div className={css.answer}>
        <svg className={css.icon}>
          <use xlinkHref="#image-complete" />
        </svg>
      </div>
    );
  }
}
