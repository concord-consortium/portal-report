import React, { PureComponent } from 'react'
import '../../css/rubric-box.less'

const sampleData =
{
  "id": "RBK1",
  "version": "12",
  "updatedMsUTC": 1519424087822,
  "originUrl": "http://concord.org/rubrics/RBK1.json",
  "scoreUsingPoints": false,
  "showRatingDescriptions": false,
  "criteria": [
    {
      "id": "C1",
      "description": "Use mathematical and/or computational representations to support explanations of factors that affect carrying capacity of ecosystems at different scales. ",
      "ratingDescriptions": [
        "Not meeting expected goals.",
        "Approaching proficiency.",
        "Approaching proficiency.",
        "Exhibiting proficiency."
      ]
    },
    {
      "id": "C2",
      "description": "Develop a model to illustrate the role of photosynthesis and cellular respiration in the cycling of carbon among the biosphere, atmosphere, hydrosphere, and geosphere.",
      "ratingDescriptions": [
        "Not meeting expected goals.",
        "Approaching proficiency.",
        "Approaching proficiency.",
        "Exhibiting proficiency."
      ]
    }
  ],
  "ratings": [
    {
      "id": "R1",
      "label": "Beginning",
      "score": 1
    },
    {
      "id": "R2",
      "label": "Developing",
      "score": 2
    },
    {
      "id": "R3",
      "label": "Proficient",
      "score": 3
    },
    {
      "id": "R4",
      "label": "Proficient",
      "score": 3
    }
  ]
}

export default class RubricBox extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return  (
      <div className="rubric-box">
        <table>
          <thead>
            <tr>
              <th key="xxx"> Aspects of Proficiency</th>
              {
                sampleData.ratings.map((rating) => <th key={rating.id}>{rating.label}</th>)
              }
            </tr>
          </thead>
          <tbody>
            {
              sampleData.criteria.map((crit) => {
                return(
                  <tr key={crit.id}>
                    <td>{crit.description}</td>
                     {
                       sampleData.ratings.map((rating) => {
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

