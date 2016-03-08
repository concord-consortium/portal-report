import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Carousel } from 'react-responsive-carousel'
import StudentName from '../containers/student-name'

import '../../css/react-responsive-carousel.css'
import '../../css/image-question-details.less'

function renderImage(img) {
  return (
    <div key={img.studentId}>
      <img src={img.url}/>
      <p className='legend'>
        <StudentName id={img.studentId}/>
      </p>
    </div>
  )
}

@pureRender
export default class ImageQuestionDetails extends Component {
  get images() {
    const { questionJSON } = this.props
    return questionJSON.children.filter(c => c.answer !== null).map(c => {
      return {url: c.answer.image_url, studentId: c.student_id}
    })
  }

  render() {
    return (
      <div className='image-question-details'>
        <Carousel axis='horizontal' showIndicators={false} showThumbs={true} showArrows={true}>
          {this.images.map(renderImage)}
        </Carousel>
      </div>
    )
  }
}
