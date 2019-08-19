import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";
import Button from "../../components/common/button";

import helpNavImg from "../../../img/help/nav.png";
import css from "../../../css/dashboard/help-modal.less";

export default class HelpModal extends PureComponent {

  render() {
    const { toggleHelpModal, helpViewVisible } = this.props;
    return (
      <Modal show={helpViewVisible} onHide={toggleHelpModal}>
        <Modal.Body>
          <div className={css.helpContent} data-cy="helpPanel">
            <h2>Help</h2>
            <h3>Navigating the Dashboard</h3>
            <img className={css.helpNav} src={helpNavImg} alt="Navigating the Dashboard - Use the 'Sort by' menu to sort. Click 'Open Students' to expand the table. Click a column header to expand a column." />
            <p><strong>NOTE:</strong> Use your mouse or two fingers on your trackpad to scroll.</p>
            <hr />
            <h3>Questions &amp; Answers</h3>
            <div className={css.symbolKey}>
              <ul className={css.symbolKeyList}>
                <li className="icon"><i className={[css.helpIcon, css.correct, "icomoon-checkmark"].join(" ")}></i> Multiple Choice Correct Response</li>
                <li className="icon"><i className={[css.helpIcon, css.incorrect, "icomoon-checkmark"].join(" ")}></i> Multiple Choice Incorrect Response</li>
                <li className="icon"><i className={[css.helpIcon, "icomoon-checkmark2"].join(" ")}></i> Non-Scored Multiple Choice Response</li>
              </ul>
              <ul className={css.symbolKeyList}>
                <li className="icon"><i className={[css.helpIcon, css.helpExpander, "icomoon-expander"].join(" ")}></i> Expand Question and Response Details</li>
                <li className="icon"><i className={[css.helpIcon, "icomoon-file-text"].join(" ")}></i> Written Response</li>
                <li className="genericAnswer"><span className={css.snapshot}>⬤</span> Snapshot (expand question to see images)</li>
              </ul>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className={css.closeButton}><Button onClick={toggleHelpModal}>close</Button></div>
        </Modal.Footer>
      </Modal>
    );
  }
}
