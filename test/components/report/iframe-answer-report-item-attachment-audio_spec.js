import React from "react";
import { render, fireEvent } from '@testing-library/react';
import { IframeAnswerReportItemAttachmentAudio } from "../../../js/components/report/iframe-answer-report-item-attachment-audio";

const handleLoadAttachmentMock = jest.fn();
const audioFileUrl = "https://portal.com/audio/123.mp3";

const pauseStub = jest.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
const playStub = jest.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(() => {});

describe("<IframeAnswerReportItemAttachmentAudio />", () => {
  it("should initially render a button to click for loading an audio attachment when no URL is provided", () => {
    const screen = render(<IframeAnswerReportItemAttachmentAudio handleLoadAttachment={handleLoadAttachmentMock} loading={false} />);
    const playButton = screen.getByRole("button", { name: "Play audio response" });
    fireEvent.click(playButton);
    expect(handleLoadAttachmentMock).toHaveBeenCalled();
  });
  it("should render a button to click for playing an audio attachment when a URL to the attachment is provided", () => {
    const screen = render(<IframeAnswerReportItemAttachmentAudio handleLoadAttachment={handleLoadAttachmentMock} loading={false} url={audioFileUrl} />);
    expect(screen.getByTestId("audio").getAttribute("src")).toEqual(audioFileUrl);
    const playButton = screen.getByRole("button", { name: "Play audio response" });
    fireEvent.click(playButton);
    expect(playStub).toHaveBeenCalled();
    expect(playButton.classList.contains("active")).toBe(true);
    fireEvent.click(playButton);
    expect(pauseStub).toHaveBeenCalled();
    expect(playButton.classList.contains("active")).toBe(false);
  });
});
