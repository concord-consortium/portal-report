import * as React from "react";

import css from "../../../css/portal-dashboard/class-nav.less";

interface IProps {
  clazzName: string; // TODO: temporary, update props as component is built
}

export class ClassNav extends React.PureComponent<IProps> {
  render() {
    return (
      <div className={css.classNav}>
        class nav for {this.props.clazzName}
      </div>
    );
  }
}
