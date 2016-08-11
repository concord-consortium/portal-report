import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

@pureRender
export default class FeedbackFilter extends Component {

  render() {
    const makeOnlyNeedReview = this.props.makeOnlyNeedReview
    const makeShowAll        = this.props.makeShowAll
    const onlyNeedReview     = this.props.showOnlyNeedReview

    const showAll = !onlyNeedReview
    const pullDownOptions    = this.props.students.push(
      {
        realName: "Select a student …",
        id: -1,
        answer: null
      })
    return (
      <div className="feedback-filters">
        <div>
          Show:
          <input id="needsReview" type="radio" name="groupType" value="needs review" checked={onlyNeedReview} onChange={makeOnlyNeedReview}/>
          <label htmlFor="needsReview"> Students that need review</label>



          <input id="all" type="radio" name="groupType" value="all" checked={showAll} onChange={makeShowAll}/>
          <label htmlFor="all"> All students </label>
        </div>
        <div>
          Jump to
          <select>
            {pullDownOptions.map( (i) => <option key={i.id} value={i.id}>{i.realName}</option>)}
          </select>
        </div>
      </div>
    )
  }

}