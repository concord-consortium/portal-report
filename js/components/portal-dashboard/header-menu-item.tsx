import React from "react";
import { MenuItemWithState } from "./header-menu";
import CheckIcon from "../../../img/svg-icons/check-icon.svg";
import { HeaderColorThemes, getThemeClass } from "../../util/misc";

import css from "../../../css/portal-dashboard/header.less";

interface IState {
  selected: boolean;
}

interface IProps {
  menuItem: MenuItemWithState;
  colorTheme?: HeaderColorThemes;
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
      <div className={`${css.menuItem} ${getThemeClass(css, this.props.colorTheme)}`} onClick={this.handleSelect} data-cy={this.props.menuItem.dataCy}>
        <CheckIcon className={`${css.check} ${getThemeClass(css, this.props.colorTheme)} ${this.state.selected ? css.selected : ""}`} />
        <div className={css.menuItemName}>{this.props.menuItem.name}</div>
      </div>
    );
  }

  private handleSelect() {
    this.props.menuItem.onSelect(!this.state.selected);
    this.setState({ selected: !this.state.selected });
  }

}
