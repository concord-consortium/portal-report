import React, { PureComponent } from "react";
import Button from "../common/button";

import ccLogoSrc from "../../../img/cc-logo.png";
import "../../../css/common/header.less";

export default class Header extends PureComponent {
  render() {
    const { onHelpButtonClick, background } = this.props;

    return (
      <div className="header" style={{background: background || "#bddfdf"}}>
        <div className="header-content">
          <img src={ccLogoSrc} className="logo" />
          <div className="status" data-cy="time">
            {onHelpButtonClick && <Button className="help" onClick={onHelpButtonClick} data-cy="help">Help</Button>}
          </div>
        </div>
      </div>
    );
  }
}
