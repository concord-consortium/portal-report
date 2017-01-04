 import React, { PureComponent } from 'react'

 export default class MaybeLink extends PureComponent {
   render() {
     const {children, url} = this.props
     const target = this.props.target || "_blank"
     if (url) {
       return <a href={url} target={target}>{children}</a>
     }
     return children
   }
 }
