import React from "react";

import css from "../../../css/portal-dashboard/answer.less";

export class NoAnswer extends React.PureComponent {
  render() {
    return (
      <div className={`${css.answer} ${css.noAnswer}`} />
    );
  }
}
