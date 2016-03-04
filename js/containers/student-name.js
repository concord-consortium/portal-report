import React, { Component } from 'react'
import { connect } from 'react-redux'

// Yes, this is React component. See:
// https://facebook.github.io/react/blog/2015/10/07/react-v0.14.html#stateless-functional-components
const StudentName = ({name}) => <span>{name}</span>

const mapStateToProps = (state, ownProps) => {
  return {
    name: state.getIn(['students', 'studentName', ownProps.id])
  }
}

const StudentNameContainer = connect(mapStateToProps)(StudentName)
export default StudentNameContainer


