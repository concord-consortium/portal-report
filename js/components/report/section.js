import React, { PureComponent } from "react";

import Page from "./page";
import Sticky from "react-stickynode";
import "../../../css/report/section.less";

export default class Section extends PureComponent {
  render() {
    const { section, reportFor } = this.props;
    const sectionName = section?.name;
    return (
      <div className={`section ${section?.visible ? "" : "hidden"}`}>
        <Sticky top={60} className={section?.nameHidden ? "hidden" : ""}>
          {sectionName}
        </Sticky>
        <div>
          {section?.children.map(p => <Page key={p?.id} page={p} reportFor={reportFor} />)}
        </div>
      </div>
    );
  }
}
