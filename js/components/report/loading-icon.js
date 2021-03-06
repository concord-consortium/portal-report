import React, { PureComponent } from "react";

import "../../../css/report/loading-icon.less";

const STEPS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

export default class LoadingIcon extends PureComponent {
  render() {
    return (
      <div className="loading-icon-container">
        <div className="loading-icon">
          {STEPS.map(angle => <div key={angle} className="element" style={{transform: `rotate(${angle}deg) translate(0,-60px)`}} />)}
        </div>
      </div>
    );
  }
}
