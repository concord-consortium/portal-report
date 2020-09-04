import React from "react";
import EnlargeIcon from "../../../../img/svg-icons/enlarge-icon.svg";

import css from "../../../../css/portal-dashboard/answers/magnify-icon.less";

interface IProps {
  isQuestion?: boolean;
  onClick: any;
}

export const MagnifyIcon: React.FC<IProps> = (props) => {
  const { isQuestion, onClick } = props;
  return (
    <div className={`${css.magnifyIcon} ${isQuestion ? css.question : ""}`} onClick={onClick} data-cy="magnify-answer">
      <EnlargeIcon className={css.icon} />
    </div>
  );
};
