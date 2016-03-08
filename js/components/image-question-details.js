import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Carousel } from 'react-responsive-carousel'

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
  get images() {
    const { question } = this.props
    return question.get('children').filter(a => a.get('answer') !== null).map(a => {
      return renderImage(a.getIn(['answer', 'imageUrl']), a.getIn(['student', 'name']), a.getIn(['student', 'id']))
    }).toJS()
  }

  render() {
    return (
      <div className='image-question-details'>
        <Carousel axis='horizontal' showIndicators={false} showThumbs={true} showArrows={true}>
          {this.images}
        </Carousel>
      </div>
    )
  }
}
