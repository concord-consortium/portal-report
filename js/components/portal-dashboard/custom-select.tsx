import React from "react";

import css from "../../../css/portal-dashboard/custom-select.less";

interface IProps {
  items: SelectItem[];
  onSelectItem: (value: string) => void;
  trackEvent: (category: string, action: string, label: string) => void;
  iconId: string;
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
      <div className={css.customSelect} ref={this.divRef}>
        { this.renderHeader() }
        { this.renderList() }
      </div>
    );
  }

  private renderHeader = () => {
    const { items, iconId } = this.props;
    const currentItem = items.find(i => i.action === this.state.current);
    const showListClass = this.state.showList ? css.showList : "";
    return (
      <div className={`${css.header} ${showListClass}`} onClick={this.handleHeaderClick}>
        <svg className={`${css.icon} ${showListClass}`}>
          <use xlinkHref={`#${iconId}`} />
        </svg>
        <div className={css.current}>{currentItem && currentItem.name}</div>
        <svg className={`${css.arrow} ${showListClass}`}>
          <use xlinkHref="#icon-up-arrow" />
        </svg>
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
            >
              <svg className={`${css.check} ${currentClass}`}>
                <use xlinkHref="#icon-check" />
              </svg>
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
