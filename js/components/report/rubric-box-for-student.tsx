import React, { PureComponent } from "react";
import Markdown from "markdown-to-jsx";
import { Rubric } from "../portal-dashboard/feedback/rubric-utils";

import "../../../css/report/rubric-box-for-student.less";

interface Props {
  rubric: Rubric;
  rubricFeedback: any;
}

const getStringValue = (value = "", fallbackValue = ""): string => {
  return value.trim().length > 0 ? value : fallbackValue;
};

export default class RubricBoxForStudent extends PureComponent<Props> {
  render() {
    const { rubric, rubricFeedback } = this.props;
    const hasGroupLabel = rubric.criteriaGroups.reduce((acc, cur) => {
      return acc || getStringValue(cur.labelForStudent, cur.label).trim().length > 0;
    }, false);
    const criteriaLabel = getStringValue(rubric.criteriaLabelForStudent, rubric.criteriaLabel);

    if (!rubric || !rubricFeedback) {
      return null;
    }

    return (
      <table className="rubric-box-for-student">
        <thead>
          <tr>
            <th colSpan={hasGroupLabel ? 2 : 1}>
              { criteriaLabel }</th><th>{ rubric.feedbackLabelForStudent }
            </th>
          </tr>
        </thead>
        <tbody>
          {rubric.criteriaGroups.map((criteriaGroup) => {
            return criteriaGroup.criteria.map((criteria, index) => {
              const showLabel = index === 0 && hasGroupLabel;
              const feedback = rubricFeedback[criteria.id];
              const ratingId = feedback?.id;
              const label = getStringValue(
                criteriaGroup.labelForStudent,
                criteriaGroup.label
              );
              const description = getStringValue(
                criteria.descriptionForStudent,
                criteria.description
              );
              const ratingDescription = getStringValue(
                criteria.ratingDescriptionsForStudent?.[ratingId],
                criteria.ratingDescriptions?.[ratingId]
              );
              const rating = rubric.ratings.find(r => r.id === ratingId);
              const ratingLabel = rating?.label.toUpperCase() ?? "";

              return (
                <tr key={criteria.id}>
                  {showLabel &&
                    <td
                      rowSpan={criteriaGroup.criteria.length}
                      className="groupLabel">
                      {label}
                    </td>
                  }
                  <td>
                    <div>
                      {criteria.iconUrl && <img src={criteria.iconUrl} />}
                      <Markdown>{description}</Markdown>
                    </div>
                  </td>
                  <td>
                    { rubric.showRatingDescriptions
                      ? `${ratingLabel} – ${ratingDescription}`
                      : ratingLabel
                    }
                  </td>
                </tr>
              );
            });
          })}
        </tbody>
      </table>
    );
  }
}
