import React from "react";

import css from "../../../css/portal-dashboard/count-container.less";

interface IProps {
  numItems: number;
  containerLabel: string;
  containerLabelType?: string;
}

export class CountContainer extends React.PureComponent<IProps> {
  render() {
  const { numItems, containerLabel, containerLabelType } = this.props;
    return (
      <div className={css.countContainer} data-cy={`num-${containerLabelType || containerLabel}-container`}>
        <div className={`${css.numItems} ${containerLabelType && css.long}`}
             data-cy={`num-${containerLabelType || containerLabel}`}>
          <span className={css.containerLabel}>{containerLabel}: </span>
          <span data-cy="item-number">{numItems}</span>
          {containerLabelType && <span>{` ${containerLabelType}`}</span>}
        </div>
      </div>
    );
  }
}
