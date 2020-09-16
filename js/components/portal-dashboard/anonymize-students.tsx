import React from "react";
import { ToggleControl } from "./toggle-control";

import css from "../../../css/portal-dashboard/anonymize-students.less";

interface IProps {
  anonymous: boolean;
  setAnonymous: (value: boolean) => void;
}

export const AnonymizeStudents: React.FC<IProps> = (props) => {
  return (
    <div className={css.anonymizeStudents} data-cy="anonymize-students">
      <ToggleControl toggleState={props.anonymous} onToggle={props.setAnonymous}/>
      <div className={css.label}>
        Anonymize students
      </div>
    </div>
  );
};
