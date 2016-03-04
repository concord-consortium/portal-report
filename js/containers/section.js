import { connect } from 'react-redux'
import Section from '../components/section'
import { isPageVisible } from '../containers/page'

export function isSectionVisible(sectionJSON, state) {
  // Section is visible if there is at least one visible page.
  return !!sectionJSON.children.find((pageJSON) => {
    return isPageVisible(pageJSON, state)
  })
}

const mapStateToProps = (state, ownProps) => {
  return {
    // Don't show section titles for external activities, as it doesn't make sense.
    nameHidden: state.getIn(['report', 'isExternalActivity']),
    hidden: !isSectionVisible(ownProps.sectionJSON, state)
  }
}

const SectionContainer = connect(mapStateToProps)(Section)
export default SectionContainer
