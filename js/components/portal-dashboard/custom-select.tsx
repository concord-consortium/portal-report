import React from "react";
import ArrowIcon from "../../../img/svg-icons/arrow-icon.svg";
import CheckIcon from "../../../img/svg-icons/check-icon.svg";

import css from "../../../css/portal-dashboard/custom-select.less";

interface IProps {
  items: SelectItem[];
  onSelectItem: (value: string) => void;
  trackEvent: (category: string, action: string, label: string) => void;
  HeaderIcon: any; // icon as react component
  dataCy: string;
}

interface IState {
  current: string;
  showList: boolean;
}

export interface SelectItem {
  action: string;
  name: string;
}

export class CustomSelect extends React.PureComponent<IProps, IState> {
  private divRef = React.createRef<HTMLDivElement>();
  constructor(props: IProps) {
    super(props);
    this.state = {
      current: props.items[0].action,
      showList: false
    };
  }

  public componentDidMount() {
    document.addEventListener("mousedown", this.handleClick, false);
  }

  public componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClick, false);
  }

  public render() {
    return (
      <div className={css.customSelect} ref={this.divRef} data-cy={this.props.dataCy}>
        { this.renderHeader() }
        { this.renderList() }
      </div>
    );
  }

  private renderHeader = () => {
    const { items, HeaderIcon } = this.props;
    const currentItem = items.find(i => i.action === this.state.current);
    const showListClass = this.state.showList ? css.showList : "";
    return (
      <div className={`${css.header} ${showListClass}`} onClick={this.handleHeaderClick}>
        { <HeaderIcon className={`${css.icon} ${showListClass}`} /> }
        <div className={css.current}>{currentItem && currentItem.name}</div>
        { <ArrowIcon className={`${css.arrow} ${showListClass}`} /> }
      </div>
    );
  }

  private renderList = () => {
    const { items } = this.props;
    return (
      <div className={`${css.list} ${(this.state.showList ? css.show : "")}`}>
        { items && items.map((item: SelectItem, i: number) => {
          const currentClass = this.state.current === item.action ? css.selected : "";
          return (
            <div
              key={`item ${i}`}
              className={`${css.listItem} ${currentClass}`}
              onClick={this.handleListClick(item.action)}
              data-cy={`list-item-${item.name.toLowerCase().replace(" ", "-")}`}
            >
              { <CheckIcon className={`${css.check} ${currentClass}`} /> }
              <div>{item.name}</div>
            </div>
          );
        }) }
      </div>
    );
  }


  private handleClick = (e: MouseEvent) => {
    if (this.divRef.current && e.target && !this.divRef.current.contains(e.target as Node)) {
      this.setState({
        showList: false
      });
    }
  }

  private handleHeaderClick = () => {
    this.setState({
      showList: !this.state.showList
    });
  }

  private handleListClick = (current: string) => () => {
    this.props.onSelectItem(current);
    this.props.trackEvent("Portal-Dashboard", "Dropdown", current);
    this.setState({
      current,
      showList: false
    });
  }

}
