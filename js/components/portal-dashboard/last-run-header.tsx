import React from "react";

import css from "../../../css/portal-dashboard/last-run-header.less";

interface IProps {
  showVisualExtension?: boolean;
}

export const LastRunHeader: React.FC<IProps> = ({ showVisualExtension }: IProps) => {
  return (
    <div className={css.lastRunHeader} data-cy="last-run-header">
      {showVisualExtension && <div className={css.visualExtension} />}
      <div className={css.lastRunHeaderText}>
        Last Run
      </div>
    </div>
  );
};
