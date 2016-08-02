import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

@pureRender
export default class FeedbackFilter extends Component {

  render() {
    const makeOnlyNeedReview = this.props.makeOnlyNeedReview
    const makeShowAll        = this.props.makeShowAll
    const onlyNeedReview     = this.props.showOnlyNeedReview

    const showAll = !onlyNeedReview
    return (
      <div className="feedback-filters">View answer(s) by:
        <select>
          <option value="0">Select a student or group...</option>
          <option value="3">Bugs X Bunny</option>
          <option value="3">Jackie Demeter</option>
          <option value="3">Eustace</option>
          <option value="3">Hilda</option>
        </select>
        Show:
        <label> Show only answers that need to be reviewed
          <input type="radio" name="groupType" value="needs review" checked={onlyNeedReview} onChange={makeOnlyNeedReview}/>
        </label>
        <label> Show all answers
          <input type="radio" name="groupType" value="all" checked={showAll} onChange={makeShowAll}/>
        </label>
      </div>
    )
  }

}