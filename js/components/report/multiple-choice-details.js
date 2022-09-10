import React, { PureComponent } from "react";

import "../../../css/report/multiple-choice-details.less";

function getChoicesStats(choices, answers, students) {
  const stats = {};
  const noResponseCount = students.length - answers.length;
  // `|| []` => in case answer doesn't have selectedChoices. It can happen if user replied to Open Response
  // question (or any other question type) and then activity author updated this question type to Multiple Choice.
  const allSelectedChoicesFlat = answers.reduce((res, answer) => res.concat(answer.selectedChoices || []), []);
  const totalAnswers = allSelectedChoicesFlat.length + noResponseCount;
  choices.forEach((choice) => {
    let count;
    if (choice.noResponseChoice) {
      count = noResponseCount;
    } else {
      count = allSelectedChoicesFlat.filter(selectedChoice => selectedChoice.id === choice.id).length;
    }
    // Avoid division by zero:
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
    const choices = this.props.question?.choices;
    const choicesArray = choices ? choices : [];
    // Add fake, no-answer choice.
    choicesArray.push({id: -1, content: "No response", noResponseChoice: true});
    return choicesArray;
  }

  render() {
    const stats = getChoicesStats(this.choices, this.props.answers, this.props.students);
    return (
      <table className="multiple-choice-details" data-cy="multiple-choice-details">
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
