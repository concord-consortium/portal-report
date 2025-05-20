import React from "react";
import classNames from "classnames";

import css from "../../../css/portal-dashboard/last-run-row.less";

interface IProps {
  backgroundClass?: string;
  isCompact?: boolean;
  lastRun: string;
  showBorders?: boolean;
}

export const LastRunRow: React.FC<IProps> = ({ backgroundClass, isCompact, lastRun, showBorders }: IProps) => {
  const lastRunDate = lastRun ? new Date(lastRun) : null;
  const localDate = lastRunDate?.toLocaleString(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit"
  });
  const localTime = lastRunDate?.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  const lastRunDisplayValue = lastRunDate
    ? <><div>{localDate}</div><div className={isCompact ? css.visuallyHidden : ""}>{localTime}</div></>
    : "N/A";

  const compactClass = isCompact ? css.compact : "";
  const borderClass = showBorders ? css.borders : "";
  const rowClass = classNames(css.timestamp, backgroundClass, borderClass, compactClass);

  return (
    <div className={rowClass} data-cy="last-run-row">
      {lastRunDisplayValue}
    </div>
  );
};
