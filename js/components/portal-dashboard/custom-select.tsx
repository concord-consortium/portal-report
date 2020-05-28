import React from "react";

import css from "../../../css/portal-dashboard/custom-select.less";

interface IProps {
  items: SelectItem[];
  setStudentSort: any;
  trackEvent: any;
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
  private setDivRef = (element: any) => {
    this.divRef = element;
  };

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
    const { items, iconId } = this.props;
    const currentItem = items.find(i => i.action === this.state.current);
    return (
      <div className={css.customSelect} ref={this.setDivRef}>
        <div className={css.header + " " + (this.state.showList ? css.showList : "")} onClick={this.handleHeaderClick}>
          <svg className={css.icon + " " + (this.state.showList ? css.showList : "")}>
            <use xlinkHref={`#${iconId}`} />
          </svg>
          <div className={css.current}>{currentItem && currentItem.name}</div>
          <svg className={css.arrow + " " + (this.state.showList ? css.showList : "")}>
            <use xlinkHref="#icon-up-arrow" />
          </svg>
        </div>
        <div className={css.list + " " + (this.state.showList ? css.show : "")}>
          { items && items.map((item: SelectItem, i: number) => (
            <div
              key={`item ${i}`}
              className={css.listItem + " " + (this.state.current === item.action ? css.selected : "")}
              onClick={this.handleListClick(item.action)}
            >
              <svg className={css.check + " " + (this.state.current === item.action ? css.selected : "")}>
                <use xlinkHref="#icon-check" />
              </svg>
              <div>{item.name}</div>
            </div>
          )) }
        </div>
      </div>
    );
  }

  private handleClick = (e: any) => {
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
    this.props.setStudentSort(current);
    this.props.trackEvent("Dashboard", "Sorted", current);
    this.setState({
      current,
      showList: false
    });
  }

}
