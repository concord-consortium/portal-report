import React from "react";
import classNames from "classnames";

import css from "../../../css/portal-dashboard/score-icon.less";

interface IProps {
  score: number;
  maxScore: number;
}

export const ScoreIcon: React.FC<IProps> = ({ score, maxScore }) => {
  // Note that coloring is strictly related to HAS ScoreBOT question, as currently that's the only project using
  // scoring. When there's another project using, the styling should updated to be more generic.
  return (
    <div className={classNames(css.score, css[`score-${score}-${maxScore}`])}>
      { score }
    </div>
  );
};
