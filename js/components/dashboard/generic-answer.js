import React, { PureComponent } from 'react'

import css from '../../../css/dashboard/generic-answer.less'

export default class GenericAnswerCell extends PureComponent {
  render () {
    const { answer } = this.props
    return (
      <div className={css.genericAnswer}>
        {
          answer &&
          <i className='icomoon-radio-unchecked' />
        }
      </div>
    )
  }
}
