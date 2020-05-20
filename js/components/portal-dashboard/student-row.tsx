import React from "react";

import css from "../../../css/portal-dashboard/student-row.less";

interface IProps {
  name: string; // TODO: temporary, update props as component is built
}

export class StudentRow extends React.PureComponent<IProps> {
  render() {
    const { name } = this.props;
    return (
      <div className={css.studentRow}>
        <div className={css.student}>
          <div className={css.name}>{name}</div>
        </div>
        <div className={css.responses}>
          <div>response content</div>
        </div>
      </div>
    );
  }
}
