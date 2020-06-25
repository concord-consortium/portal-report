import React from "react";
import { Map } from "immutable";
import ArrowIcon from "../../../img/svg-icons/arrow-icon.svg";

import css from "../../../css/portal-dashboard/overlay-class-response.less";

interface IProps {
  currentQuestion?: Map<string, any>;
}
interface IState {
  hideResponseArea: boolean;
}

export class ClassResponse extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      hideResponseArea: false
    };
  }
  render() {
    const chevronClass = this.state.hideResponseArea ? `${css.arrow}  ${css.hideResponseArea}` : `${css.arrow}`;
    const responseAreaClass = this.state.hideResponseArea ? `${css.responseArea} ${css.hidden}` : `${css.responseArea}`;
    return (
      <div data-cy="overlay-class-response-area">
        <div className={css.responseHeader}>
          <div className={css.title} data-cy="class-response-title">Class Response</div>
          <div className={css.showHideButton} onClick={this.handleChevronClick} data-cy="show-hide-class-response-button">
            <ArrowIcon className={chevronClass} />
          </div>
        </div>
        <div className={responseAreaClass} data-cy="class-response-content">
          This is where aggregate info of class responses will go
        </div>
      </div>
    );
  }

  private handleChevronClick = () => {
    this.setState({
      hideResponseArea: !this.state.hideResponseArea
    });
  }
}
