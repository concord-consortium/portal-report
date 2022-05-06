import React, { PureComponent } from "react";
import { AudioIcon } from "../../../img/svg-icons/audio-icon";

import "../../../css/report/iframe-answer-report-item-attachment-audio.less";

interface IProps {
  handleLoadAttachment: () => void;
  loading: boolean;
  url?: string;
}

interface IState {
  audioPlaying: boolean;
}

export class IframeAnswerReportItemAttachmentAudio extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      audioPlaying: false
    };
    this.handleToggleAudio = this.handleToggleAudio.bind(this);
    this.handleStartAudio = this.handleStartAudio.bind(this);
    this.handleEndAudio = this.handleEndAudio.bind(this);
  }

  handleToggleAudio(event: React.MouseEvent) {
    const { audioPlaying } = this.state;
    const button = event.target as HTMLButtonElement;
    const audioPlayer = button.previousElementSibling as HTMLAudioElement;
    if (!audioPlaying) {
      audioPlayer.play();
      this.setState({audioPlaying: true});
    } else {
      audioPlayer.pause();
      this.setState({audioPlaying: false});
    }
  }

  handleStartAudio() {
    this.setState({audioPlaying: true});
  }

  handleEndAudio() {
    this.setState({audioPlaying: false});
  }

  renderInitialState() {
    const { handleLoadAttachment } = this.props;
    return (
      <div className="audio-response">
        <button data-cy="audio-response-button" onClick={handleLoadAttachment}>
          <AudioIcon className="audioIcon" />
          Play audio response
        </button>
      </div>
    );
  }

  renderReadyState() {
    const { url } = this.props;
    const { audioPlaying } = this.state;
    return (
      <div className="audio-response">
        <audio data-testid="audio" controls src={url} preload="auto" autoPlay={true} onPlay={this.handleStartAudio} onEnded={this.handleEndAudio} />
        <button className={audioPlaying ? "active" : ""} onClick={this.handleToggleAudio}>
          <AudioIcon className="audioIcon" />
          Play audio response
        </button>
      </div>
    );
  }

  render () {
    const { url } = this.props;
    if (url) {
      return this.renderReadyState();
    }
    return this.renderInitialState();
  }

}
