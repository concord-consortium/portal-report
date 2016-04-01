import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import ImageAnswerModal from './image-answer-modal'

import '../../css/image-answer.less'

@pureRender
export default class ImageAnswer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalOpen: false
    }
  }

  render() {
    const { answer } = this.props
    const imgAnswer = answer.get('answer')
    return (
      <div>
        <div className='image-answer'>
          <img src={imgAnswer.get('imageUrl')} onClick={() => this.setState({modalOpen: true})}/>
          <div className='image-answer-note'>{imgAnswer.get('note')}</div>
        </div>
        <ImageAnswerModal answer={answer} show={this.state.modalOpen} onHide={() => this.setState({modalOpen: false})}/>
      </div>
    )
  }
}
