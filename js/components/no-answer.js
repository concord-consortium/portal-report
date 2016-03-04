import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

@pureRender
export default class NoAnswer extends Component {
  render() {
    return (
      <div>
        No response
      </div>
    )
  }
}
