import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

@pureRender
export default class FeedbackFilter extends Component {

  render() {
    const makeOnlyNeedReview = this.props.makeOnlyNeedReview
    const makeShowAll        = this.props.makeShowAll
    const onlyNeedReview     = this.props.showOnlyNeedReview

    const showAll = !onlyNeedReview
    const pullDownOptions    = this.props.studentNames.push("Select a student …")
    return (
      <div className="feedback-filters">
        <div>
          Show:
          <input id="needsReview" type="radio" name="groupType" value="needs review" checked={onlyNeedReview} onChange={makeOnlyNeedReview}/>
          <label for="needsReview"> Students that need review</label>



          <input id="all" type="radio" name="groupType" value="all" checked={showAll} onChange={makeShowAll}/>
          <label for="all"> All students </label>
        </div>
        <div>
          Jump to
          <select>
            {pullDownOptions.map( (i) => <option value={i}>{i}</option>)}
          </select>
        </div>
      </div>
    )
  }

}