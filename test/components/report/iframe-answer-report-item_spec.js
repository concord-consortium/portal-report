import React from "react";
import { shallow } from "enzyme";
import { IframeAnswerReportItem } from "../../../js/components/report/iframe-answer-report-item";

jest.mock("../../../js/components/report/iframe-answer-report-item-attachment", () => ({
  IframeAnswerReportItemAttachment: () => {
    return <div>MockIframeAnswerReportItemAttachment</div>;
  }
}));
const renderLinkMock = jest.fn();

const answerText = "testing 123";
const emptyAnswerText = null;
const textAnswer = Map([
  ["answer", answerText],
  ["answerText", answerText]
]);
const textAnswerWithNoText = Map([
  ["answer", emptyAnswerText],
  ["answerText", emptyAnswerText]
]);
const textItem = {
  name: "text answer",
  type: "answerText"
};

const answerHtml = "<center><marquee><blink>testing 123</blink></marquee></center>";
const htmlAnswer = Map([
  ["answer", answerHtml],
  ["answerText", answerText]
]);
const htmlItem = {
  html: answerHtml,
  name: "answerHTML",
  type: "html"
};

const attachmentAnswer = Map([
  ["answer", answerText],
  ["answerText", answerText],
  ["attachments", {
    test_attachment: {
      contentType: "audio/mpeg"
    }
  }]
]);
const attachmentItem = {
  name: "test_attachment",
  type: "attachment"
};

const linksAnswer = Map([
  ["answer", answerText],
  ["answerText", answerText]
]);
const linksItem = {
  name: "answerLinks",
  type: "links"
};

describe("<IframeAnswerReportItem />", () => {
  it("should render text for an item of type answerText", () => {
    const wrapper = shallow(<IframeAnswerReportItem answer={textAnswer} item={textItem} answerText={answerText} renderLink={renderLinkMock} />);
    expect(wrapper.text()).toContain(answerText);
  });
  it("should render 'No written response' for an item of type answerText that has no text response", () => {
    const wrapper = shallow(<IframeAnswerReportItem answer={textAnswerWithNoText} item={textItem} answerText={emptyAnswerText} renderLink={renderLinkMock} />);
    expect(wrapper.html()).toEqual(expect.stringContaining("No written response"));
  });
  it("should render an iframe with a srcDoc attribute that equals the supplied HTML for an item of type html", () => {
    const wrapper = shallow(<IframeAnswerReportItem answer={htmlAnswer} item={htmlItem} answerText={answerHtml} renderLink={renderLinkMock} />);
    expect(wrapper.find("iframe")).toBeDefined();
    expect(wrapper.find("iframe").props().srcDoc).toEqual(answerHtml);
  });
  it("should render an attachment component for an item of type attachment", () => {
    const wrapper = shallow(<IframeAnswerReportItem answer={attachmentAnswer} item={attachmentItem} answerText={answerText} renderLink={renderLinkMock} />);
    expect(wrapper.html()).toEqual(expect.stringContaining("MockIframeAnswerReportItemAttachment"));
  });
  it("should call renderLinks for an item of type links", () => {
    shallow(<IframeAnswerReportItem answer={linksAnswer} item={linksItem} answerText={answerText} renderLink={renderLinkMock} />);
    expect(renderLinkMock).toHaveBeenCalled();
  });
});
