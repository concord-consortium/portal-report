import React, { PureComponent } from 'react'
import InteractiveIframe from './interactive-iframe'

import '../../css/iframe-answer.less'

export default class IframeAnswer extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      iframeVisible: false
    }
    this.toggleIframe = this.toggleIframe.bind(this)
  }

  toggleIframe (event) {
    const { answer } = this.props
    if (answer.get('displayInIframe')) {
      // If displayInIframe == true, we won't follow the link.
      event.preventDefault()
      this.setState({iframeVisible: !this.state.iframeVisible})
    }
  }

  renderLink () {
    const { answer } = this.props
    let decorator =
      answer.get('displayInIframe') ? '' : <span className='pr-icon-external-link' />
    return <a href={answer.get('answer')} onClick={this.toggleIframe} target='_blank'>View Work {decorator}</a>
  }

  renderIframe () {
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
    } else if (!answer.get('answerType')) {
      // handle case where answer type is not set this would happen with an portal previous
      // to 1.21.0
      url = answer.get('answer')
      state = null
    }
    return (
      <div>
        {!alwaysOpen ? <div><a href='#' onClick={this.toggleIframe}>Hide</a></div> : ''}
        <InteractiveIframe src={url} state={state} width={answer.get('width')} height={answer.get('height')} />
      </div>
    )
  }

  shouldRenderIframe () {
    const { answer, alwaysOpen } = this.props
    const { iframeVisible } = this.state

    if (answer.get('displayInIframe')) {
      return iframeVisible || alwaysOpen
    } else {
      return false
    }
  }

  render () {
    return (
      <div className='iframe-answer'>
        {this.shouldRenderIframe() ? this.renderIframe() : this.renderLink()}
      </div>
    )
  }
}
