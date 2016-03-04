import { connect } from 'react-redux'
import Activity from '../components/activity'
import { isSectionVisible } from '../containers/section'

export function isActivityVisible(activityJSON, state) {
  // Activity is visible if there is at least one visible section.
  return !!activityJSON.children.find((sectionJSON) => {
    return isSectionVisible(sectionJSON, state)
  })
}

const mapStateToProps = (state, ownProps) => {
  return {
    hidden: !isActivityVisible(ownProps.activityJSON, state)
  }
}

const ActivityContainer = connect(mapStateToProps)(Activity)
export default ActivityContainer
