import React, { PureComponent } from "react";
import Activity from "../../containers/report/activity.js";
import Sticky from "react-stickynode";
import "../../../css/report/sequence.less";

export default class Sequence extends PureComponent {
  render() {
    const { sequence, reportFor } = this.props;
    const sequenceName = sequence.get("name");
    return (
      <div>
        <Sticky top={40} className="sequence">
          <h2>{sequenceName}</h2>
        </Sticky>
        <div>
          {sequence.get("children").map(a => <Activity key={a.get("id")} activity={a} reportFor={reportFor} sequenceName={sequenceName} />)}
        </div>
      </div>
    );
  }
}
