import React, { PureComponent } from 'react'
import InteractiveIframe from './interactive-iframe'

import '../../css/iframe-answer.less'

export default class IframeAnswer extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      iframeVisible: false
    }
    this.toggleIframe = this.toggleIframe.bind(this)
  }

  toggleIframe(event) {
    const { answer } = this.props
    if (answer.get('displayInIframe')) {
      // If displayInIframe == true, we won't follow the link.
      event.preventDefault()
      this.setState({iframeVisible: !this.state.iframeVisible})
    }
  }

  renderLink() {
    const { answer } = this.props
    return <a href={answer.get('answer')} onClick={this.toggleIframe} target='_blank'>View work</a>
  }

  renderIframe() {
    const { answer, alwaysOpen } = this.props
    let url
    let state
    // There are two supported answer types handled by iframe question: simple link or interactive state.
    if (answer.get('answerType') === 'Saveable::ExternalLinkUrl') {
      // Answer field is just the reportable URL. We don't need any state.
      url = answer.get('answer')
      state = null
    } else if (answer.get('answerType') === 'Saveable::InteractiveState') {
      // URL field is provided together with answer. Answer field is a state that will be passed
      // to the iframe using iframe-phone.
      url = answer.get('url')
      state = answer.get('answer')
    }
    return (
        <div>
          {!alwaysOpen ? <div><a href='#' onClick={this.toggleIframe}>Hide</a></div> : ''}
          <InteractiveIframe src={url} state={state} width={answer.get('width')} height={answer.get('height')}/>
        </div>
      )
  }

  displayInIframe() {
    return (this.props.displayInIframe && this.state.iframeVisible) || (this.props.displayInIframe && this.props.alwaysOpen)
  }

  render() {
    const { alwaysOpen } = this.props
    const { iframeVisible } = this.state
    return (
      <div className='iframe-answer'>
        { this.displayInIframe() ? this.renderIframe() : this.renderLink()}
      </div>
    )
  }
}
