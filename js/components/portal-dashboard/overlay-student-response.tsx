/* eslint-disable no-console */
import React from "react";
import { getFormattedStudentName } from "../../util/student-utils";
import ArrowLeftIcon from "../../../img/svg-icons/arrow-left-icon.svg";

import css from "../../../css/portal-dashboard/overlay-student-response.less";

interface IProps {
  students: any;
  isAnonymous: boolean;
}

export class StudentResponse extends React.PureComponent<IProps> {
  render() {
    const { students, isAnonymous } = this.props;
    return (
      <div data-cy="overlay-class-response-area">
            <div className={css.responseHeader}>
              <div className={css.title}>Student Name</div>
              <div className={css.nextStudentButtons}>
                <div className={css.button}
                  data-cy="previous-student-button">
                  <ArrowLeftIcon className={css.icon} />
                </div>
                <div className={css.button}
                  data-cy="next-student-button">
                  <ArrowLeftIcon className={css.icon} />
                </div>
              </div>
            </div>
        <div className={css.responseArea}>
          This is where student's response will go
        </div>
      </div>
    );
  }
}
