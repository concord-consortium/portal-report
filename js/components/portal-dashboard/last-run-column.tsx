import React from "react";
import { LastRunRow } from "./last-run-row";

import css from "../../../css/portal-dashboard/last-run-column.less";

interface IProps {
  isAnonymous: boolean;
  isCompact: boolean;
  students: any;
}

export const LastRunColumn: React.FC<IProps> = (props) => {
  const { students, isCompact } = props;
  const compactClass = isCompact ? css.compact : "";

  return (
    <div className={`${css.lastRunColumn} ${compactClass}`} data-cy="last-run-column">
      { students?.map((student: any, i: number) => {
        const lastRun = student.get("lastRun");
        const backgroundClass = i % 2 === 0 ? css.even : css.odd;

        return (
          <LastRunRow
            key={`student-last-run-${i}`}
            backgroundClass={backgroundClass}
            lastRun={lastRun}
            isCompact={isCompact}
          />
        );
      })}
    </div>
  );
};
