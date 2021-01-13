import React from "react";
import LaunchIcon from "../../../img/svg-icons/launch-icon.svg";

import css from "../../../css/portal-dashboard/rubric-table.less";


export class RubricTableContainer extends React.PureComponent {
  render() {
    const selected = true;

    return (
      <div className={css.rubricContainer} data-cy="rubric-table">
        <div className={css.columnHeaders}>
          <div className={css.rubricDescriptionHeader}>
            <div className={css.scoringGuideArea}>
              <a className={css.launchButton}>
                <LaunchIcon className={css.icon} />
              </a>
              Scoring Guide
            </div>
            <div className={css.rubricDescriptionTitle}>Aspects of Proficiency</div>
          </div>
          <div className={css.rubricScoreHeader}>
            <div className={css.rubricScoreLevel}>Proficient</div>
            <div className={css.rubricScoreNumber}>(3)</div>
          </div>
          <div className={css.rubricScoreHeader}>
            <div className={css.rubricScoreLevel}>Developing</div>
            <div className={css.rubricScoreNumber}>(2)</div>
          </div>
          <div className={css.rubricScoreHeader}>
            <div className={css.rubricScoreLevel}>Beginning</div>
            <div className={css.rubricScoreNumber}>(1)</div>
          </div>
        </div>
        <div className={css.rubricTable}>
          <div className={css.rubricTableRow}>
            <div className={css.rubricDescription}>Make a claim, supported by evidence, that indicates that when the population of one organism changes, the pattern of impact on other organisms is based on the types of interactions between the organisms.</div>
            <div className={css.rubricScore}>
              <div className={css.radioButton}>
                {selected && <div className={css.selected} />}
              </div>
            </div>
            <div className={css.rubricScore}>
              <div className={css.radioButton}>
                {selected && <div className={css.selected} />}
              </div>
            </div>
            <div className={css.rubricScore}>
              <div className={css.radioButton}>
                {selected && <div className={css.selected} />}
              </div>
            </div>
          </div>
        </div>
      </div>
      // </div>
    );
  }
}
