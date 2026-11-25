import React from "react";
import { Map } from "immutable";
import { LEARNER_MODE_ABBREVIATION, LEARNER_MODE_MARKER, LEARNER_MODE_TOOLTIP } from "../../util/student-utils";

import css from "../../../css/portal-dashboard/student-name-with-marker.less";

interface IProps {
  name: string;
  student?: Map<any, any>;
  // Use on one line that is too narrow for long names. The name is cut off with "…", but the marker stays.
  truncate?: boolean;
}

// Shows a name made by `getFormattedStudentName`. For a teacher's learner mode account, "LM" in the
// " (LM)" marker gets a tooltip that tells what it means, as in the Portal. A `title` tooltip is not
// read reliably by screen readers, so they get hidden text in place of "LM".
export const StudentNameWithMarker: React.FC<IProps> = ({ name, student, truncate }) => {
  if (!student?.get("isTeacherPreviewStudent") || !name.endsWith(LEARNER_MODE_MARKER)) {
    return <>{name}</>;
  }
  const baseName = name.slice(0, -LEARNER_MODE_MARKER.length);
  const marker = (
    <> (<abbr title={LEARNER_MODE_TOOLTIP} aria-hidden="true">{LEARNER_MODE_ABBREVIATION}</abbr>
      <span className={css.screenReaderOnly}>{LEARNER_MODE_TOOLTIP}</span>)</>
  );
  if (!truncate) {
    return <>{baseName}{marker}</>;
  }
  return (
    <span className={css.truncated}>
      <span className={css.baseName}>{baseName}</span>
      <span className={css.marker}>{marker}</span>
    </span>
  );
};
