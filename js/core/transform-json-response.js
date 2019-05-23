import { normalize, schema } from "normalizr";
import humps from "humps";
import queryString from "query-string";

// Transforms deeply nested structure of activity or sequence
// into normalized form where objects are grouped by ID.
// See: https://github.com/gaearon/normalizr
export default function normalizeResourceJSON(json) {
  // preprocessResourceJson transforms response a bit, e.g. provides additional properties that can be calculated
  // at this point or ensures that we always deal with a sequence.
  const camelizedJson = preprocessResourceJson(humps.camelizeKeys(json, (key, convert) =>
    // don't convert keys that are only upercase letters and numbers.
    // This is useful for rubric keys for example "C2" and "R1"
    /^[A-Z0-9_]+$/.test(key) ? key : convert(key)
  ));

  const sequence = new schema.Entity("sequences", {});
  const activity = new schema.Entity("activities", {});
  const section = new schema.Entity("sections");
  const page = new schema.Entity("pages", {});
  const question = new schema.Entity("questions", {}, {
    idAttribute: value => value.key
  });
  sequence.define({
    children: [ activity ],
  });
  activity.define({
    children: [ section ],
  });
  section.define({
    children: [ page ],
  });
  page.define({
    children: [ question ],
  });
  return normalize(camelizedJson, sequence);
}

export function preprocessResourceJson(resourceJson) {
  // Provide fake sequence if it's not present to simplify app logic.
  if (resourceJson.type === "Activity") {
    resourceJson = {
      id: 1,
      name: "",
      type: "Sequence",
      children: [ resourceJson ],
    };
  }
  // Add some question properties, e.g. question numbers, selection, visibility.
  resourceJson.children.forEach(activity => {
    activity.children.forEach(section => {
      // Questions are numbered within the whole activity.
      let currentQuestionNumber = 1;
      section.children.forEach(page => {
        page.children.forEach(question => {
          question.questionNumber = currentQuestionNumber++;
          // Id is not enough, as questions of different type can have the same id.
          question.key = `${question.type}-${question.id}`;
          // Nothing is selected by default.
          question.selected = false;
          if (question.type === "multiple_choice") {
            // Multiple choice question is scored if at least one choice is marked as correct.
            question.scored = question.choices.some(c => c.correct);
          }
        });
      });
    });
  });
  return resourceJson;
}

function applyVisibilityFilter(questions, visibilityFilter) {
  Object.values(questions).forEach(question => {
    question.selected = false;
    question.visible = false;
  });
  visibilityFilter.questions.forEach(key => {
    // in some cases, we will only be looking at a subset of questions,
    // for example when viewing the activity report for a sequence.
    // There may not be a question for the key. Check first.
    if (questions[key]) {
      questions[key].selected = true;
      questions[key].visible = true;
    }
  });
}

// Keys are generated by normalizr above, so just copy them to the object hashes.
function copyAnswerKeysToObjects(answers) {
  Object.keys(answers).forEach(key => {
    answers[key].key = key;
  });
}

// Provide additional property in student hash, it's useful for anonymization.
function saveStudentsRealNames(students) {
  Object.values(students).forEach(student => {
    student.realName = student.name;
  });
}

function urlParamOverrides(response) {
  const {reportFor, studentId} = queryString.parse(window.location.search);
  if (reportFor) {
    response.type = reportFor;
  }
  if (studentId && reportFor === "student") {
    response.studentId = studentId;
    response.hideControls = true;
    if (response.result) {
      response.result.hideControls = true;
    }
  }
}
