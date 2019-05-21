import React, { PureComponent } from "react";
import Activity from "../../containers/report/activity.js";
import Sticky from "react-stickynode";
import "../../../css/report/investigation.less";

export default class Investigation extends PureComponent {
  render() {
    const { investigation, reportFor } = this.props;
    const investigationName = investigation.get("name");
    return (
      <div>
        <Sticky top={40} className="investigation">
          <h2>{investigationName}</h2>
        </Sticky>
        <div>
          {investigation.get("children").map(a => <Activity key={a.get("id")} activity={a} reportFor={reportFor} investigationName={investigationName} />)}
        </div>
      </div>
    );
  }
}
