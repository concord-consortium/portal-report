import React from "react";
import { MenuItemWithState } from "./header-menu";
import CheckIcon from "../../../img/svg-icons/check-icon.svg";

import css from "../../../css/portal-dashboard/header.less";

interface IState {
  selected: boolean;
}

interface IProps {
  menuItem: MenuItemWithState;
}

export class HeaderMenuItem extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      selected: false
    };
    this.handleSelect = this.handleSelect.bind(this);
  }

  render() {
    return (
      <div className={css.menuItem} onClick={this.handleSelect} data-cy={this.props.menuItem.dataCy}>
        <CheckIcon className={`${css.check} ${this.state.selected ? css.selected : ""}`} />
        <div className={css.menuItemName}>{this.props.menuItem.name}</div>
      </div>
    );
  }

  private handleSelect() {
    this.props.menuItem.onSelect(!this.state.selected);
    this.setState({ selected: !this.state.selected });
  }

}
