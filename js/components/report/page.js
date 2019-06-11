import React, { PureComponent } from "react";
import Question from "../../containers/report/question";
import MaybeLink from "./maybe-link";
import Sticky from "react-stickynode";
import "../../../css/report/page.less";

export default class Page extends PureComponent {
  render() {
    const { page, reportFor } = this.props;
    const pageName = page.get("name");
    const showLinks = reportFor === "class";
    const url = showLinks ? page.get("url") : null;
    return (
      <div className={`page ${page.get("visible") ? "" : "hidden"}`}>
        <Sticky top={100}>
          <h4>
            <MaybeLink url={url}>
              <span>Page: {pageName}</span>
            </MaybeLink>
          </h4>
        </Sticky>
        <div>
          {page.get("children").map((question) => {
            return <Question key={question.get("id")} question={question} reportFor={reportFor} url={url} />;
          })}
        </div>
      </div>
    );
  }
}
