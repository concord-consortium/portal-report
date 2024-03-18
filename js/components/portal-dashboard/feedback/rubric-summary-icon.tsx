import React, { useMemo, useState }  from "react";
import classNames from "classnames";
import { Rubric, getFeedbackColor } from "./rubric-utils";
import { RubricSummaryModal } from "./rubric-summary-modal";
import { TrackEventFunction } from "../../../actions";
import { ScoringSettings } from "../../../util/scoring";

import css from "../../../../css/portal-dashboard/feedback/rubric-summary-icon.less";

interface IProps {
  rubric: Rubric;
  feedbacks: any;
  activityId: string;
  scoringSettings: ScoringSettings;
  trackEvent: TrackEventFunction;
}

type RatingsCounts = Record<string, number>;
export interface ICriteriaCount {
  id: string;
  numStudents: number;
  ratings: RatingsCounts;
}

type PartialRubricFeedback = Record<string, {
  id: string;
  score: number;
}>

const iconWidth = 80;
const maxIconHeight = Math.round(iconWidth / 1.66); // keep rectangular
const defaultIconRowHeight = 18;

export const RubricSummaryIcon: React.FC<IProps> = (props) => {
  const { rubric, feedbacks: { rubricFeedbacks }, activityId, scoringSettings, trackEvent } = props;
  const [modalOpen, setModalOpen] = useState(false);

  const handleToggleModal = () => setModalOpen(prev => {
    if (!prev) {
      trackEvent("Portal-Dashboard", "OpenRubricSummaryDetails", {label: activityId});
    }
    return !prev;
  });

  const { hasRubricFeedback, criteriaCounts } = useMemo(() => {
    const criteriaCounts: ICriteriaCount[] = [];
    const getNumNonZeroScores = (rubricFeedback: PartialRubricFeedback) => {
      return Object.values(rubricFeedback).reduce((acc, cur) => {
        if (cur.score > 0) {
          acc++;
        }
        return acc;
      }, 0);
    };
    const numCompletedRubrics = rubricFeedbacks.reduce((acc: number, cur: PartialRubricFeedback) => {
      const numNonZeroScores = getNumNonZeroScores(cur);
      if (numNonZeroScores >= rubric.criteria.length) {
        acc++;
      }
      return acc;
    }, 0);
    const hasRubricFeedback = numCompletedRubrics > 0;

    if (hasRubricFeedback) {
      const ratingsCounts = rubric.ratings.reduce<RatingsCounts>((acc, cur) => {
        acc[cur.id] = 0;
        return acc;
      }, {});

      rubric.criteria.forEach(criteria => {
        const criteriaCount: ICriteriaCount = {
          id: criteria.id,
          numStudents: 0,
          ratings: {...ratingsCounts},
        };
        criteriaCounts.push(criteriaCount);

        rubricFeedbacks.forEach((rubricFeedback: PartialRubricFeedback) => {
          const numNonZeroScores = getNumNonZeroScores(rubricFeedback);
          if (numNonZeroScores >= rubric.criteria.length) {
            const criteriaFeedback = rubricFeedback[criteria.id];
            if (criteriaFeedback?.score > 0) {
              criteriaCount.numStudents++;
              criteriaCount.ratings[criteriaFeedback.id]++;
            }
          }
        });
      });
    }

    return { hasRubricFeedback, criteriaCounts };
  }, [rubricFeedbacks, rubric]);

  const renderIcon = () => {
    const rowHeight = Math.min(Math.round(maxIconHeight / criteriaCounts.length), defaultIconRowHeight);

    return (
      <div className={classNames(css.rubricSummaryIconRows, {[css.active]: modalOpen})} style={{width: iconWidth}}>
        {criteriaCounts.map(({id, numStudents, ratings}) => {
          const rowStyle: React.CSSProperties = {
            height: rowHeight,
          };
          return (
            <div className={css.rubricSummaryIconRow} key={id} style={rowStyle}>
              {rubric.ratings.map(rating => {
                const percentage = numStudents > 0 ? (ratings[rating.id] / numStudents) * 100 : 0;
                const title = `${Math.round(percentage)}% ${rating.label} - click for details`;
                const ratingStyle: React.CSSProperties = {
                  height: rowHeight,
                  width: `${percentage}%`,
                  backgroundColor: getFeedbackColor({rubric, score: rating.score}),
                };
                return <div key={rating.id} style={ratingStyle} title={title} />;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div
        className={css.rubricSummaryIcon}
        data-cy="rubric-summary-icon"
        onClick={hasRubricFeedback ? handleToggleModal : undefined}
        style={{cursor: hasRubricFeedback ? "pointer" : "initial"}}
      >
        {hasRubricFeedback ? renderIcon() : <>N/A</>}
      </div>
      {modalOpen && <RubricSummaryModal
        onClose={handleToggleModal}
        rubric={rubric}
        criteriaCounts={criteriaCounts}
        scoringSettings={scoringSettings}
      />}
    </>
  );
};
