import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/multiple-choice-details.less'

function noAnswer(answerJSON) {
  return answerJSON.answer === null
}

function answerIncludeChoice(answerJSON, choiceJSON) {
  return !noAnswer(answerJSON) && answerJSON.answer.find(a => a.choice === choiceJSON.choice)
}

function getChoicesStats(choices, answers) {
  let stats = {}
  const answersFlat = answers.reduce((res, answerJSON) => res.concat(answerJSON.answer), [])
  choices.forEach((choiceJSON) => {
    const filterFunc = choiceJSON.noAnswer ? noAnswer : ansJSON => answerIncludeChoice(ansJSON, choiceJSON)
    const count = answers.filter(filterFunc).length
    stats[choiceJSON.choice] = {
      count,
      percent: (count / answersFlat.length * 100).toFixed(1)
    }
  })
  return stats
}

@pureRender
export default class MultipleChoiceDetails extends Component {
  get choices() {
    // Add fake, no-answer, choice.
    return [...this.props.questionJSON.choices, {choice: 'No response', noAnswer: true}]
  }

  get answers() {
    return this.props.questionJSON.children
  }

  render() {
    const stats = getChoicesStats(this.choices, this.answers)
    return (
      <table className='multiple-choice-details'>
        <tbody>
          {this.choices.map((choiceJSON, idx) => {
            const { choice, is_correct } = choiceJSON
            return <ChoiceRow key={idx} idx={idx} choice={choice} isCorrect={is_correct}
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
