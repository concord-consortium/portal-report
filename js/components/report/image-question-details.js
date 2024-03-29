import React, { PureComponent } from "react";
import { Carousel } from "react-responsive-carousel";
import ImageAnswerModal from "./image-answer-modal";

import "../../../css/report/react-responsive-carousel.css";
import "../../../css/report/image-question-details.less";

function renderNote(note) {
  if (note && note.length > 0) {
    return <div className="note">{note} </div>;
  }
  return "";
}
function renderImage(src, author, key, note) {
  const className = (note && note.length > 0) ? "slide-container" : "slide-container vertical";
  return (
    <div className={className} key={key}>
      <img src={src} />
      <div className="author">{author} </div>
      {renderNote(note)}
    </div>
  );
}

export default class ImageQuestionDetails extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      selectedAnswer: 0,
    };
    this.openModal = this.openModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.saveSelectedAnswer = this.saveSelectedAnswer.bind(this);
  }

  openModal() {
    this.setState({modalOpen: true});
  }

  hideModal() {
    this.setState({modalOpen: false});
  }

  saveSelectedAnswer(index) {
    this.setState({selectedAnswer: index});
  }

  // If the answer has no answer field, a.getIn(["answer", "imageUrl"]) returns undefined
  // which then is !== null, so these invalid answers get included in this list
  get answersWithImage() {
    const { answers } = this.props;
    return answers.filter(a => a.getIn(["answer", "imageUrl"]) !== null);
  }

  get selectedAnswerProps() {
    return this.answersWithImage.get(this.state.selectedAnswer);
  }

  renderImages() {
    return this.answersWithImage.map(a => {
      return renderImage(a.getIn(["answer", "imageUrl"]), a.getIn(["student", "name"]), a.getIn(["student", "id"]), a.getIn(["answer", "text"]));
    }).toJS();
  }

  renderCarousel() {
    // react-responsive-carousel fails when we pass empty array. Probably it's related to this issue:
    // https://github.com/leandrowd/react-responsive-carousel/issues/30
    if (this.answersWithImage.size === 0) { return null; }
    return <Carousel axis="horizontal" selectedItem={this.state.selectedAnswer} onChange={this.saveSelectedAnswer}
      showIndicators={false} showThumbs showArrows onClickItem={this.openModal}>
      {this.renderImages()}
    </Carousel>;
  }

  render() {
    return (
      <div className="image-question-details">
        {this.renderCarousel()}
        <ImageAnswerModal answer={this.selectedAnswerProps} show={this.state.modalOpen} onHide={this.hideModal} />
      </div>
    );
  }
}
