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
  constructor(props: IProps) {
    super(props);
    this.state = {
      current: props.items[0].action,
      showList: false
    };
  }

  render() {
    const { items } = this.props;
    const currentItem = items.find(i => i.action === this.state.current);
    return (
      <div className={css.customSelect}>
        <div className={css.header} onClick={this.handleHeaderClick}>
          <div className={css.icon}>i</div>
          <div>{currentItem && currentItem.name}</div>
          <div className={css.icon}>a</div>
        </div>
        { this.state.showList &&
          <div className={css.list}>
            { items && items.map((item: SelectItem, i: number) => (
              <div key={`item ${i}`} className={css.listItem} onClick={this.handleListClick(item.action)}>
                <div className={css.icon}>c</div>
                <div className={css.item}>{item.name}</div>
              </div>
            )) }
          </div>
        }
      </div>
    );
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
