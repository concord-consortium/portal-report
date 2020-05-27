import React from "react";

import css from "../../../css/portal-dashboard/custom-select.less";

interface IProps {
  items: SelectItem[];
  setStudentSort: any;
  trackEvent: any;
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
  // private setDivRef: (element: any) => void;
  private setDivRef = (element: any) => {
    this.divRef = element;
  };

  constructor(props: IProps) {
    super(props);
    this.state = {
      current: props.items[0].action,
      showList: false
    };

    //this.setDivRef = (element) => {
    //  this.divRef = element;
    //};
  }

  public componentDidMount() {
    document.addEventListener("mousedown", this.handleClick, false);
  }

  public componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClick, false);
  }

  public render() {
    const { items } = this.props;
    const currentItem = items.find(i => i.action === this.state.current);
    return (
      <div className={css.customSelect} ref={this.setDivRef}>
        <div className={css.header + " " + (this.state.showList ? css.showList : "")} onClick={this.handleHeaderClick}>
          <div className={css.icon}/>
          <div>{currentItem && currentItem.name}</div>
          <div className={css.icon}/>
        </div>
        { this.state.showList &&
          <div className={css.list}>
            { items && items.map((item: SelectItem, i: number) => (
              <div
                key={`item ${i}`}
                className={css.listItem + " " + (this.state.current === item.action ? css.selected : "")}
                onClick={this.handleListClick(item.action)}
              >
                <div className={css.icon}/>
                <div>{item.name}</div>
              </div>
            )) }
          </div>
        }
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
