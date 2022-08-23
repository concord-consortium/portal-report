import React from "react";
import ArrowIcon from "../../../img/svg-icons/arrow-icon.svg";
import CheckIcon from "../../../img/svg-icons/check-icon.svg";
import { SvgIcon } from "../../util/svg-icon";
import { ColorTheme } from "../../util/misc";
import { TrackEventFunction } from "../../actions";

import css from "../../../css/portal-dashboard/custom-select.less";

interface IProps {
  dataCy: string;
  disableDropdown?: boolean;
  HeaderIcon?: SvgIcon;
  items: SelectItem[];
  value?: string;
  trackEvent: TrackEventFunction;
  width?: number;
  colorTheme?: ColorTheme;
}

interface IState {
  value: string;
  showList: boolean;
}

export interface SelectItem {
  value: string;
  label: string;
  icon?: SvgIcon;
  onSelect?: (value?: any) => void;
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
    const { items, HeaderIcon, value, width, colorTheme } = this.props;
    const currentValue = value || this.state.value;
    const currentItem = items.find(i => i.value === currentValue);
    const showListClass = this.state.showList ? css.showList : "";
    const disabled = this.props.disableDropdown ? css.disabled : "";
    const CurrentHeaderIcon = currentItem?.icon || HeaderIcon;
    const colorClass = colorTheme ? css[colorTheme] : "";
    return (
      <div className={`${css.header} ${showListClass} ${disabled} ${colorClass}`} onClick={this.handleHeaderClick} style={{width}}>
        { CurrentHeaderIcon && <CurrentHeaderIcon className={`${css.icon} ${showListClass}`} /> }
        <div className={css.current}>{currentItem?.label}</div>
        { <ArrowIcon className={`${css.arrow} ${showListClass} ${disabled}`} /> }
      </div>
    );
  }

  private renderList = () => {
    const { items, value, width, colorTheme } = this.props;
    const currentValue = value || this.state.value;
    const colorClass = colorTheme ? css[colorTheme] : "";
    return (
      <div className={`${css.list} ${(this.state.showList ? css.show : "")}`} style={{width}}>
        { items && items.map((item: SelectItem, i: number) => {
          const currentClass = currentValue === item.value ? css.selected : "";
          return (
            <div
              key={`item ${i}`}
              className={`${css.listItem} ${currentClass} ${colorClass}`}
              onClick={this.handleChange(item.value)}
              data-cy={`list-item-${item.label.toLowerCase().replace(/\ /g, "-")}`}
            >
              { item.icon
                ? <item.icon className={css.icon} />
                : <CheckIcon className={`${css.check} ${currentClass}`} />
              }
              <div>{item.label}</div>
              { item.icon && <CheckIcon className={`${css.check} ${currentClass} ${css.rightJustify}`} /> }
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
    const item = this.props.items.find((si: SelectItem) => si.value === value);
    item?.onSelect?.();
    this.setState({
      value,
      showList: false
    });
  }
}
