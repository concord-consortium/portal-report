import React, { PureComponent } from 'react'

import '../../css/feedback-filters.less'


export default class FeedbackFilter extends PureComponent {

  render() {
    const makeOnlyNeedReview = this.props.makeOnlyNeedReview
    const makeShowAll        = this.props.makeShowAll
    const onlyNeedReview     = this.props.showOnlyNeedReview

    const showAll = !onlyNeedReview
    const disable = this.props.disable
    const pullDownOptions    = this.props.students.unshift(
      {
        realName: "Select a student …",
        id: -1,
        answer: null
      })

    return (
      <div className="feedback-filters">
        <div className="filters">
          <div>
            Show:
            <input id="needsReview" type="radio" name="groupType" value="needs review" checked={onlyNeedReview} onChange={makeOnlyNeedReview}/>
            <label htmlFor="needsReview"> Students that need review</label>



            <input id="all" type="radio" name="groupType" value="all" checked={showAll} onChange={makeShowAll}/>
            <label htmlFor="all"> All students </label>
          </div>
          <div>
            Jump to
            <select onChange={this.props.studentSelected}>
              {pullDownOptions.map( (i,index) => <option key={i.id} value={index}>{i.realName}</option>)}
            </select>
          </div>
        </div>
        { disable ? <div className="disabled"/>  : null}
      </div>
    )
  }

}