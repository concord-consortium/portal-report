import React from "react";

import css from "../../../css/portal-dashboard/student-row.less";

interface IProps {
  name: string;
}

export class StudentRow extends React.PureComponent<IProps> {
  render() {
    const { name } = this.props;
    return (
      <div className={css.studentRow}>
        <div className={css.student}>
          <div className={css.name} data-cy="student-name">{name}</div>
        </div>
        <div className={css.responses}>
          <div>response content</div>
        </div>
      </div>
    );
  }
}
