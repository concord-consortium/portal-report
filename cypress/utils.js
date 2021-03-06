function getChildrenData(parent, label) {
    let children = parent.children;

    if (children != null) {
        return children;
    } else {
        cy.log("There were no " + label);
    }
}

// CSS modules randomize class names, so it is safest to select with explicit data-* attributes
// https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements
export function getByCypressTag(cypressTag) {
  return cy.get(`[data-cy=${cypressTag}]`);
}

export function getAnswerByQuestionType(answerData) {
    let answer;
    let questionType;
    questionType = answerData.type;

    if (answerData.type != null) {
        switch (questionType) {
            case ("Embeddable::MultipleChoice"):
                answer = answerData.answer[0].choice;
                break;
            case ("Embeddable::OpenResponse"):
                answer = answerData.answer;
                break;
            case ("Embeddable::ImageQuestion"):
                answer = answerData.answer.image_url;
                break;
            case ("Embeddable::Iframe"):
                answer = answerData.answer;
                break;
        }
        return answer;
    } else {
        cy.log("Could not find answer for question type " + questionType);
    }
}

export function getPageQuestionData(pageData) {
    return getChildrenData(pageData, "questions");
}

export function getActivityData(sequenceData) {
    return getChildrenData(sequenceData, "activities");
}

export function getSectionData(activityData) {
  return getChildrenData(activityData, "sections");
}

export function getPageData(activityData) {
    let pageData;

    // this is only looking at the first section
    pageData = getSectionData(activityData)[0].children;
    if (pageData != null) {
        return pageData;
    } else {
        cy.log("There was no activity page data");
    }
}

export function getActivityQuestionData(activityData) {
    let questionData = [];

    let pageData = getPageData(activityData) || [];
    pageData.forEach(page => {
      questionData = questionData.concat(getPageQuestionData(page) || []);
    });
    if (questionData.length > 0) {
        return questionData;
    } else {
        cy.log("There was no question data");
    }
}
