import React from "react";
import { MenuItemWithState } from "./header-menu";
import CheckIcon from "../../../img/svg-icons/check-icon.svg";
import { ColorTheme } from "../../util/misc";

import css from "../../../css/portal-dashboard/header.less";

interface IState {
  selected: boolean;
}

interface IProps {
  menuItem: MenuItemWithState;
  colorTheme?: ColorTheme;
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
    const { menuItem, colorTheme } = this.props;
    const colorClass = colorTheme ? css[colorTheme] : "";
    return (
      <div className={`${css.menuItem} ${colorClass}`} onClick={this.handleSelect} data-cy={menuItem.dataCy}>
        <CheckIcon className={`${css.check} ${colorClass} ${this.state.selected ? css.selected : ""}`} />
        <div className={css.menuItemName}>{menuItem.name}</div>
      </div>
    );
  }

  private handleSelect() {
    this.props.menuItem.onSelect(!this.state.selected);
    this.setState({ selected: !this.state.selected });
  }

}
