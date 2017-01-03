import React, { PureComponent } from 'react'
import Question from '../components/question'
import MaybeLink from '../components/maybe-link'
import Sticky from 'react-stickynode';
import '../../css/page.less'

export default class Page extends PureComponent {
  render() {
    const { page, reportFor } = this.props
    const pageName = page.get('name')
    const url =  page.get('url')
    return (
      <div className={`page ${page.get('visible') ? '' : 'hidden'}`}>
        <Sticky top={80}>
          <h4>
            <MaybeLink url={url}>
              <span>Page: {pageName}</span>
            </MaybeLink>
          </h4>
        </Sticky>
        <div>
          {page.get('children').map((question) => {
              return <Question key={question.get('key')} question={question} reportFor={reportFor} url={page.get('url')} />
          })}
        </div>
      </div>
    )
  }
}
