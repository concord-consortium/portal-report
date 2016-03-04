import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

@pureRender
export default class IframeAnswer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      iframeVisible: false
    }
    this.toggleIframe = this.toggleIframe.bind(this)
  }

  toggleIframe(event) {
    const { answerJSON } = this.props
    if (answerJSON.display_in_iframe) {
      // If display_in_iframe == true, we won't follow the link.
      event.preventDefault()
      this.setState({iframeVisible: !this.state.iframeVisible})
    }
  }

  renderLink() {
    const { answerJSON } = this.props
    return <a href={answerJSON.answer} onClick={this.toggleIframe} target='_blank'>View work</a>
  }

  renderIframe() {
    const { answerJSON } = this.props
    return (
        <div>
          <div><a href='#' onClick={this.toggleIframe}>Hide</a></div>
          <iframe src={answerJSON.answer}
                  width={answerJSON.width || '300px'}
                  height={answerJSON.height || '300px'}
                  style={{border: 'none', marginTop: '0.5em'}}>
          </iframe>
        </div>
      )
  }

  render() {
    const { iframeVisible } = this.state
    return (
      <div>
        {iframeVisible ? this.renderIframe() : this.renderLink()}
      </div>
    )
  }
}
