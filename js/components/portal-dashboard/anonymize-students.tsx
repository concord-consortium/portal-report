import React from "react";
import { ToggleControl } from "./toggle-control";

import css from "../../../css/portal-dashboard/anonymize-students.less";

interface IProps {
  setAnonymous: (value: boolean) => void;
}

export const AnonymizeStudents: React.FC<IProps> = (props) => {
  return (
    <div className={css.anonymizeStudents}>
      <ToggleControl onToggle={props.setAnonymous}/>
      <div className={css.label}>
        Anonymize students
      </div>
    </div>
  );
};
