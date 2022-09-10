import React, { PureComponent } from "react";
import Question from "../../containers/report/question";
import MaybeLink from "./maybe-link";
import Sticky from "react-stickynode";
import "../../../css/report/page.less";

export default class Page extends PureComponent {
  render() {
    const { page, reportFor } = this.props;
    const pageName = page?.name;
    const showLinks = reportFor === "class";
    const previewUrl = showLinks ? page?.previewUrl : null;
    return (
      <div className={`page ${page?.visible ? "" : "hidden"}`}>
        <Sticky top={100}>
          <h4>
            <MaybeLink url={previewUrl}>
              <span>Page: {pageName}</span>
            </MaybeLink>
          </h4>
        </Sticky>
        <div>
          {page?.children.map((question) => {
            return <Question key={question?.id} question={question} reportFor={reportFor} url={previewUrl} />;
          })}
        </div>
      </div>
    );
  }
}
