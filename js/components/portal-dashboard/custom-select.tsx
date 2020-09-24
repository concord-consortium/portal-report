import React from "react";
import ArrowIcon from "../../../img/svg-icons/arrow-icon.svg";
import CheckIcon from "../../../img/svg-icons/check-icon.svg";
import { SvgIcon } from "../../util/svg-icon";

import css from "../../../css/portal-dashboard/custom-select.less";

interface IProps {
  dataCy: string;
  disableDropdown?: boolean;
  HeaderIcon: SvgIcon;
  isHeader?: boolean;
  items: SelectItem[];
  onChange: (value: string) => void;
  value?: string;
  trackEvent: (category: string, action: string, label: string) => void;
}

interface IState {
  value: string;
  showList: boolean;
}

export interface SelectItem {
  value: string;
  label: string;
}

export class CustomSelect extends React.PureComponent<IProps, IState> {
  private divRef = React.createRef<HTMLDivElement>();
  constructor(props: IProps) {
    super(props);
    this.state = {
      value: props.value || props.items[0].value,
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
    const { items, HeaderIcon, value } = this.props;
    const currentValue = value || this.state.value;
    const currentItem = items.find(i => i.value === currentValue);
    const showListClass = this.state.showList ? css.showList : "";
    const useHeader = this.props.isHeader ? css.topHeader : "";
    const disabled = this.props.disableDropdown ? css.disabled : "";
    return (
      <div className={`${css.header} ${useHeader} ${showListClass} ${disabled}`} onClick={this.handleHeaderClick}>
        { <HeaderIcon className={`${css.icon} ${showListClass}`} /> }
        <div className={css.current}>{currentItem && currentItem.label}</div>
        { <ArrowIcon className={`${css.arrow} ${showListClass} ${disabled}`} /> }
      </div>
    );
  }

  private renderList = () => {
    const { items, value } = this.props;
    const currentValue = value || this.state.value;
    const useHeader = this.props.isHeader ? css.topHeader : "";
    return (
      <div className={`${css.list} ${useHeader} ${(this.state.showList ? css.show : "")}`}>
        { items && items.map((item: SelectItem, i: number) => {
          const currentClass = currentValue === item.value ? css.selected : "";
          return (
            <div
              key={`item ${i}`}
              className={`${css.listItem} ${currentClass}`}
              onClick={this.handleChange(item.value)}
              data-cy={`list-item-${item.label.toLowerCase().replace(/\ /g, "-")}`}
            >
              <CheckIcon className={`${css.check} ${currentClass}`} />
              <div>{item.label}</div>
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

  private handleChange = (value: string) => () => {
    this.props.onChange(value);
    this.props.trackEvent("Portal-Dashboard", "Dropdown", value);
    this.setState({
      value,
      showList: false
    });
  }
}
