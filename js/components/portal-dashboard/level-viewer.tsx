import React from "react";

import css from "../../../css/portal-dashboard/level-viewer.less";
import { ProgressLegendContainer } from "./legend-container";

export class LevelViewer extends React.PureComponent {
  render() {
    return (
      <div className={css.levelViewer} data-test="level-viewer">
        level viewer content
        <ProgressLegendContainer />
      </div>
    );
  }
}
