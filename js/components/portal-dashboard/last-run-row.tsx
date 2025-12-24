import React from "react";
import classNames from "classnames";

import { localDateTime } from "../../util/datetime";

import css from "../../../css/portal-dashboard/last-run-row.less";

interface IProps {
  backgroundClass?: string;
  isCompact?: boolean;
  lastRun: string;
  showBorders?: boolean;
}

export const LastRunRow: React.FC<IProps> = ({ backgroundClass, isCompact, lastRun, showBorders }: IProps) => {
  const lastRunDate = lastRun ? new Date(lastRun) : null;
  const {date, time} = localDateTime(lastRunDate);
  const lastRunDisplayValue = lastRunDate
    ? <><div>{date}</div><div className={isCompact ? css.visuallyHidden : ""}>{time}</div></>
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
