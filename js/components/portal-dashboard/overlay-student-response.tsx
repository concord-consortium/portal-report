import React from "react";
import { Map } from "immutable";
import { getFormattedStudentName } from "../../util/student-utils";
import Answer from "../../containers/portal-dashboard/answer";
import ArrowLeftIcon from "../../../img/svg-icons/arrow-left-icon.svg";

import css from "../../../css/portal-dashboard/overlay-student-response.less";

interface IProps {
  students: any;
  isAnonymous: boolean;
  currentQuestion?: Map<string, any>;
}
interface IState {
  currentStudentIndex: number;
}

export class StudentResponse extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      currentStudentIndex: 0
    };
  }
  render() {
    const { currentQuestion, students, isAnonymous } = this.props;
    const { currentStudentIndex } = this.state;
    return (
      <div className={css.studentResponse} data-cy="overlay-student-response-area">
        <div className={css.responseHeader}>
          <div className={css.title} data-cy='overlay-student-name'>{getFormattedStudentName(isAnonymous, students.get(currentStudentIndex))}</div>
          <div className={css.nextStudentButtons}>
            <div className={css.button + (currentStudentIndex > 0 ? "" : " " + css.disabled) }
              data-cy="previous-student-button" onClick={this.changeCurrentStudent(currentStudentIndex - 1)}>
              <ArrowLeftIcon className={css.icon} />
            </div>
            <div className={css.button + (currentStudentIndex < students.size - 1 ? "" : " " + css.disabled )}
              data-cy="next-student-button" onClick={this.changeCurrentStudent(currentStudentIndex + 1)}>
              <ArrowLeftIcon className={css.icon} />
            </div>
          </div>
        </div>
        <div className={css.responseArea}>
          {/* TODO: add new answer component which determines types and centering */}
          <Answer question={currentQuestion} student={students.get(currentStudentIndex)} inDetail={true}/>
        </div>
      </div>
    );
  }

  private changeCurrentStudent = (index: number) => () => {
    const newIndex = Math.min(Math.max(0, index), this.props.students.size - 1);
      this.setState({ currentStudentIndex: newIndex });
  }
}
