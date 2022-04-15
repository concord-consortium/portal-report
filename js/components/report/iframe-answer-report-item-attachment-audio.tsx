import React, { PureComponent } from "react";
import AudioIcon from "../../../img/svg-icons/audio-icon.svg";

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
    this.handlePlayAudio = this.handlePlayAudio.bind(this);
    this.handleStartAudio = this.handleStartAudio.bind(this);
    this.handleEndAudio = this.handleEndAudio.bind(this);
  }

  handlePlayAudio(event: React.MouseEvent) {
    const button = event.target as HTMLButtonElement;
    const audioPlayer = button.previousElementSibling as HTMLAudioElement;
    if (audioPlayer.paused || audioPlayer.ended) {
      audioPlayer.play();
      this.setState({audioPlaying: true});
    } else {
      audioPlayer.pause();
      this.setState({audioPlaying: true});
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
        <button onClick={handleLoadAttachment}>
          <AudioIcon className="audioIcon" />
          Play student audio response
        </button>
      </div>
    );
  }

  renderReadyState() {
    const { url } = this.props;
    const { audioPlaying } = this.state;
    return (
      <div className="audio-response">
        <audio controls src={url} preload="auto" autoPlay={true} onPlay={this.handleStartAudio} onEnded={this.handleEndAudio} />
        <button className={audioPlaying ? "active" : ""} onClick={this.handlePlayAudio}>
          <AudioIcon className="audioIcon" />
          Play student audio response
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
