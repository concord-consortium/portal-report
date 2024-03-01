import React, { PureComponent } from "react";
import classNames from "classnames";

import css from "../../../../css/portal-dashboard/feedback/score-input.less";

interface IProps {
  score: number;
  minScore: number;
  disabled: boolean;
  className?: string;
  children?: React.ReactNode;
  onChange: (score: number) => void;
  onBlur?: (score: number) => void;
}

export class ScoreInput extends PureComponent<IProps> {

  render() {
    const { score, minScore, disabled, className, children } = this.props;

    return (
      <div className={classNames(css.scoreInput, className, {[css.disabled]: disabled})}>
        {children}
        <input type="number" disabled={disabled} value={score} min={minScore} onChange={this.handleChange} onKeyDown={this.handleKeyDown} onBlur={this.handleBlur} />
      </div>
    );
  }

  private handleKeyDown = (e: React.KeyboardEvent) => {
    if (/[.,]/.test(e.key)) {
      e.preventDefault();
    }
  }

  private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {minScore, onChange} = this.props;
    const score = parseInt(e.target.value, 10);
    if (score >= minScore) {
      onChange(score);
    }
  }

  private handleBlur = () => {
    const {onBlur, score} = this.props;
    onBlur?.(score);
  }
}

