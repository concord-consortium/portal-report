import React from "react";
import { shallow } from "enzyme";
import { IframeAnswerReportItemAttachment } from "../../../js/components/report/iframe-answer-report-item-attachment";

jest.mock("../../../js/components/report/iframe-answer-report-item-attachment-audio", () => ({
  IframeAnswerReportItemAttachmentAudio: () => {
    return <div>MockIframeAnswerReportItemAttachmentAudio</div>;
  }
}));

const answerText = "testing 123";
const item = {
  type: "attachment",
  name: "test_attachment"
};
const answerUnknownType = Map([
  ["answer", answerText],
  ["answerText", answerText],
  ["attachments", {
    test_attachment: {}
  }]
]);
const answerTextType = Map([
  ["answer", answerText],
  ["answerText", answerText],
  ["attachments", {
    test_attachment: {
      contentType: "text/plain"
    }
  }]
]);
const answerAudioType = Map([
  ["answer", answerText],
  ["answerText", answerText],
  ["attachments", {
    test_attachment: {
      contentType: "audio/mpeg"
    }
  }]
]);

describe("<IframeAnswerReportItemAttachment />", () => {
  it("should render an error message for an unknown contentType", () => {
    const wrapper = shallow(<IframeAnswerReportItemAttachment answer={answerUnknownType} item={item} />);
    expect(wrapper.find("div").text()).toContain("Can't load test_attachment, content type not known.");
  });
  it("should render an error message for a contentType that is not yet handled", () => {
    const wrapper = shallow(<IframeAnswerReportItemAttachment answer={answerTextType} item={item} />);
    expect(wrapper.find("div").text()).toContain("Attachments of type text/plain are not yet handled");
  });
  it("should render a component for a contentType that can be handled", () => {
    const wrapper = shallow(<IframeAnswerReportItemAttachment answer={answerAudioType} item={item} />);
    expect(wrapper.html()).toEqual(expect.stringContaining("MockIframeAnswerReportItemAttachmentAudio"));
  });
});
