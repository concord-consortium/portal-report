import React from "react";
import { fromJS } from "immutable";
import { Provider } from "react-redux";
import { renderIntoDocument, findRenderedDOMComponentWithClass } from "react-dom/test-utils";
import AnswersTable from "../../../js/containers/report/answers-table";

describe("<AnswersTable />", () => {
  const question = fromJS({
    scoreEnabled: true,
    feedbackEnabled: true
  });
  const hidden = false;
  const showCompare = false;
  const anonymous = false;
  const answers = fromJS([]);
  const state = {};
  const store = { getState: () => fromJS(state), subscribe: () => {}, dispatch: () => {} };
  const params = { hidden, showCompare, anonymous, question, answers };

  describe("with a question", () => {
    it("should render <AnswersTable> with Score and Feedback text", () => {
      const component = renderIntoDocument(
        <Provider store={store} >
          <AnswersTable {...params} />
        </Provider>
      );
      const found = findRenderedDOMComponentWithClass(component, "answers-table");
      expect(found.textContent).toMatch(/Student/);
      expect(found.textContent).toMatch(/Response/);
      expect(found.textContent).toMatch(/Score/);
      expect(found.textContent).toMatch(/Feedback/);
    });
  });

  describe("With out a question", () => {
    const question = null;
    const params = { hidden, showCompare, anonymous, question, answers };

    it("should render <AnswersTable> without Score or Feedback text", () => {
      const component = renderIntoDocument(
        <Provider store={store} >
          <AnswersTable {...params} />
        </Provider>
      );
      const found = findRenderedDOMComponentWithClass(component, "answers-table");
      expect(found.textContent).toMatch(/Student/);
      expect(found.textContent).toMatch(/Response/);
      expect(found.textContent).not.toMatch(/Score/);
      expect(found.textContent).not.toMatch(/Feedback/);
    });
  });
});
