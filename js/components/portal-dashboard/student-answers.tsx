import React from "react";

import css from "../../../css/portal-dashboard/student-answers.less";

interface IProps {
  students: any;
  activities: any;
}

export class StudentAnswers extends React.PureComponent<IProps> {
  render() {
    const { students, activities } = this.props;
    return (
      <div className={css.studentAnswers}>
        <div className={css.studentAnswersRow}>
          <div className={css.activityAnswers}></div>
          <div className={css.activityAnswers}></div>
        </div>
      </div>
    );
  }
}
