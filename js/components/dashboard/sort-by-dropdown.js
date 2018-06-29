import React, { PureComponent } from 'react'
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS } from '../../actions/dashboard'

export default class SortByDropdown extends PureComponent {
  constructor (props) {
    super(props)
    this.onSortSelected = this.onSortSelected.bind(this)
  }

  onSortSelected (e) {
    const { setStudentSort } = this.props
    setStudentSort(e.target.value)
  }

  render () {
    return (
      <div>
        {'Sort by: '}
        <select onChange={this.onSortSelected}>
          <option value={SORT_BY_NAME}>Student Name</option>
          <option value={SORT_BY_MOST_PROGRESS}>Most Progress</option>
          <option value={SORT_BY_LEAST_PROGRESS}>Least Progress</option>
        </select>
      </div>
    )
  }
}
