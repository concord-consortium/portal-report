import React, { PureComponent } from "react";

import "../../../css/report/multiple-choice-details.less";

function noAnswer(answer) {
  return answer.answer === null;
}

function answerIncludeChoice(answer, choice) {
  return !noAnswer(answer) && answer.answer.find(a => a.choice === choice.content);
}

function getChoicesStats(choices, answers) {
  let stats = {};
  const answersFlat = answers.reduce((res, answer) => res.concat(answer.answer), []);
  const totalAnswers = answersFlat.length;
  choices.forEach((choice) => {
    const filterFunc = choice.noAnswer ? noAnswer : ans => answerIncludeChoice(ans, choice);
    const count = answers.filter(filterFunc).length;
    // avoid division by zero:
    const percent = totalAnswers === 0 ? 0 : count / totalAnswers * 100;
    stats[choice.id] = {
      count,
      percent: (percent).toFixed(1),
    };
  });
  return stats;
}

export default class MultipleChoiceDetails extends PureComponent {
  get choices() {
    const choices = this.props.question.get("choices").toJS();
    // Add fake, no-answer choice.
    choices.push({id: -1, content: "No response", noAnswer: true});
    return choices;
  }

  get answers() {
    return this.props.question.get("answers").toJS();
  }

  render() {
    const stats = getChoicesStats(this.choices, this.answers);
    return (
      <table className="multiple-choice-details">
        <tbody>
          {this.choices.map((choiceDesc, idx) => {
            const { id, content, correct } = choiceDesc;
            return <ChoiceRow key={id} idx={idx} content={content} correct={correct}
              percent={stats[id].percent} count={stats[id].count} />;
          })}
        </tbody>
      </table>
    );
  }
}

const ChoiceRow = ({idx, content, correct, percent, count}) => (
  <tr className={correct ? "correct" : ""}>
    <td className="td-prompt">{idx}. {content}</td>
    <td className="bar-container"><div className="bar" style={{width: percent + "%"}} /></td>
    <td className="number">{percent}%</td>
    <td className="number">{count}</td>
  </tr>
);
