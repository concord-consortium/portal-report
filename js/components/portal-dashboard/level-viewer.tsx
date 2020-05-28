import React from "react";

import css from "../../../css/portal-dashboard/level-viewer.less";
import { ProgressLegendContainer } from "./legend-container";

export class LevelViewer extends React.PureComponent {
  render() {
    return (
      <div className={css.levelViewer}>
        level viewer content
        <ProgressLegendContainer />
      </div>
    );
  }
}
