// A little meta programming to make your brain hurt
function generate(childrenFunction, label) {
  const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
  const childrenFunctionName = "get" + capitalizedLabel;
  return function() {
    let children = this.children;
    if (children != null) {
      if (childrenFunction) {
        children.each(child => {
          child[childrenFunctionName] = childrenFunction;
        });
      }
      return children;
    } else {
      cy.log("no " + label + " found");
    }
  };
}

const getQuestions = generate(null, "questions");
const getPages = generate(getQuestions, "pages");
const getSections = generate(getPages, "sections");
const getActivities = generate(getSections, "activities");

function sequenceHelper(sequence) {
  sequence.getActivities = getActivities;
  return sequence;
}
