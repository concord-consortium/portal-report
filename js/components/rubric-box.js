import React, { PureComponent } from 'react'
import '../../css/rubric-box.less'

export default class RubricBox extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const {rubric} = this.props
    if(!rubric) { return null; }
    else {
      return  (
        <div className="rubric-box">
          <table>
            <thead>
              <tr>
                <th key="xxx"> Aspects of Proficiency</th>
                {
                  rubric.ratings.map((rating) => <th key={rating.id}>{rating.label}</th>)
                }
              </tr>
            </thead>
            <tbody>
              {
                rubric.criteria.map((crit) => {
                  return(
                    <tr key={crit.id}>
                      <td>{crit.description}</td>
                      {
                        rubric.ratings.map((rating) => {
                          return(
                            <td key={rating.id}>
                              <div className="center">
                                <input
                                  name={crit.id}
                                  type="radio"
                                  id="rating.id"/>
                              </div>
                            </td>
                          )
                        })
                      }

                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      )
    }
  }
}

