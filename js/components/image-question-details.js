import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Carousel } from 'react-responsive-carousel'
import ImageAnswerModal from './image-answer-modal'

import '../../css/react-responsive-carousel.css'
import '../../css/image-question-details.less'

function renderImage(src, legend, key) {
  return (
    <div key={key}>
      <img src={src}/>
      <p className='legend'>
        {legend}
      </p>
    </div>
  )
}

@pureRender
export default class ImageQuestionDetails extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalOpen: false,
      selectedAnswer: 0
    }
    this.openModal = this.openModal.bind(this)
    this.hideModal = this.hideModal.bind(this)
    this.saveSelectedAnswer = this.saveSelectedAnswer.bind(this)
  }

  openModal(imageIndex) {
    this.setState({modalOpen: true})
  }

  hideModal() {
    this.setState({modalOpen: false})
  }

  // I'm surprised that we need to save selected answer, but otherwise it seems to lose its state each time
  // we re-render. I don't know why, but it seems quite easy and it was the best react carousel I've found. ;)
  saveSelectedAnswer(index) {
    this.setState({selectedAnswer: index})
  }

  get images() {
    const { question } = this.props
    return question.get('children').filter(a => a.get('answer') !== null).map(a => {
      return renderImage(a.getIn(['answer', 'imageUrl']), a.getIn(['student', 'name']), a.getIn(['student', 'id']))
    }).toJS()
  }

  get selectedAnswerProps() {
    const { question } = this.props
    return question.get('children').get(this.state.selectedAnswer)
  }

  render() {
    return (
      <div className='image-question-details'>
        <Carousel axis='horizontal' selectedItem={this.state.selectedAnswer} onChange={this.saveSelectedAnswer}
                  showIndicators={false} showThumbs={true} showArrows={true} onClickItem={this.openModal}>
          {this.images}
        </Carousel>
        <ImageAnswerModal answer={this.selectedAnswerProps} show={this.state.modalOpen} onHide={this.hideModal}/>
      </div>
    )
  }
}
