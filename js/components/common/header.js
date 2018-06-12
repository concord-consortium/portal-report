import React, { PureComponent } from 'react'
import Button from '../report/button'

import ccLogoSrc from '../../../img/cc-logo.png'
import '../../../css/common/header.less'

export default class Header extends PureComponent {
  render () {
    const { isFetching, lastUpdated, onRefreshClick } = this.props

    return (
      <div className='header'>
        <div className='header-content'>
          <img src={ccLogoSrc} className='logo' />
          <div className='status'>
            {lastUpdated && <span>Last updated at {new Date(lastUpdated).toLocaleTimeString()} </span>}
            {onRefreshClick && <Button onClick={onRefreshClick} disabled={isFetching}>Refresh</Button>}
          </div>
        </div>
      </div>
    )
  }
}
