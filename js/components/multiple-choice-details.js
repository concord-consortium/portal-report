import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/multiple-choice-details.less'

function noAnswer(answer) {
  return answer.answer === null
}

function answerIncludeChoice(answer, choice) {
  return !noAnswer(answer) && answer.answer.find(a => a.choice === choice.choice)
}

function getChoicesStats(choices, answers) {
  let stats = {}
  const answersFlat = answers.reduce((res, answer) => res.concat(answer.answer), [])
  choices.forEach((choice) => {
    const filterFunc = choice.noAnswer ? noAnswer : ans => answerIncludeChoice(ans, choice)
    const count = answers.filter(filterFunc).length
    stats[choice.choice] = {
      count,
      percent: (count / answersFlat.length * 100).toFixed(1)
    }
  })
  return stats
}

@pureRender
export default class MultipleChoiceDetails extends Component {
  get choices() {
    const choices = this.props.question.get('choices').toJS()
    // Add fake, no-answer choice.
    choices.push({choice: 'No response', noAnswer: true})
    return choices
  }

  get answers() {
    return this.props.question.get('responses').toJS()
  }

  render() {
    const stats = getChoicesStats(this.choices, this.answers)
    return (
      <table className='multiple-choice-details'>
        <tbody>
          {this.choices.map((choiceDesc, idx) => {
            const { choice, isCorrect } = choiceDesc
            return <ChoiceRow key={idx} idx={idx} choice={choice} isCorrect={isCorrect}
                              percent={stats[choice].percent} count={stats[choice].count}/>
          })}
        </tbody>
      </table>
    )
  }
}

const ChoiceRow = ({idx, choice, isCorrect, percent, count}) => (
  <tr className={isCorrect ? 'correct' : ''}>
    <td>{idx}. {choice}</td>
    <td className='bar-container'><div className='bar' style={{width: percent + '%'}}></div></td>
    <td className='number'>{percent}%</td>
    <td className='number'>{count}</td>
  </tr>
)
