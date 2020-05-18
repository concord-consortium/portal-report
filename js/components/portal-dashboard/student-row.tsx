import * as React from "react";

import css from "../../../css/portal-dashboard/student-row.less";

interface IProps {
  name: string;
}

export class StudentRow extends React.PureComponent<IProps> {
  render() {
    const { name } = this.props;
    return (
      <div className={css.studentRow}>
        <div className={css.name}>{name}</div>
        <div className={css.responses}>response content</div>
      </div>
    );
  }
}
