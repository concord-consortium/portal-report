# Review of callAPI

callAPI is a middleware that is used to call apis as part of other actions. It was probably based on some early practices for async requests in Redux. The redux toolkit now provides [createAsyncThunk](https://redux-toolkit.js.org/api/createAsyncThunk) which solves the same problem. The redux tool kit approach is based on a promise generating function (an async function). Our current callApi middleware works with declarative types. So in our approach the action creator function is separated from the logic which handles the api request. While in the redux toolkit approach they are bundled together in the same place.

As part of calling the api both of these approaches support firing 2 additional actions one for api success and one for failure. In our approach we configure the callApi structure with action creator functions for these 2 actions. The action creator function is called with the result of the callApi main function. In createAsyncThunk the actions have predefined names based on a prefix.

Our approach looks like actions nested inside of other actions, where the nested actions have types just like the main action. In my opinion, this nested action setup makes the code harder to follow.

It seems possible to use createAsyncThunk without using the rest of redux toolkit. One part that will be confusing is how the action name or types are handled. Redux toolkit seems to use a slash notation with its actions types. It does support typing, so we can probably type things to make them pretty safe.

Here are what I think are tricky parts of this refactor:
- where to draw the line between a full redux toolkit refactoring versus a small addition of createAsyncThunk? We could also add in createSlice, and further switch to use the redux toolkit approach for the action names or types for all of our actions. But do we want to go that far?
- Error handling. Our current code has some generic callAPI error handling which shows errors to the user. Probably the same thing can be done with createAsyncThunk, but might take some design.

# General Redux Notes
- action creators: these are the functions that return action structures or functions that take a dispatch argument. https://redux.js.org/recipes/reducing-boilerplate#action-creators
- thunks: this is the name for the functions that take a dispatch and getState argument which are returned by some action creators.  https://redux.js.org/tutorials/essentials/part-5-async-logic#thunk-functions
- what is handling the return types of the action creators?
  A: the mapDispatchToProps function is used in the top level components, it wraps the action creator function in another function which calls dispatch on the result of the action creator. It is this wrapped function which is actually passed with the component's props.
- action creators and reducers often have similar names. For example showUnselectedQuestions, watch out for this.
- The callAPI design seems to be related to: https://redux.js.org/recipes/reducing-boilerplate#async-action-creators. In the section "you can write your own middleware", they define a middleware which takes a function to do the actual api call and then multiple action types to call in the different cases.
- More info on createAsyncThunk:
https://redux.js.org/tutorials/essentials/part-5-async-logic#fetching-data-with-createasyncthunk

# Current Usage of callAPI

Action types that use callAPI middleware:

## REQUEST_PORTAL_DATA
- action creator: fetchAndObserveData
- callAPI: API_FETCH_PORTAL_DATA_AND_AUTH_FIRESTORE
- return: object, but other parts of action creator return a thunk
- data reducer updates state to indicate it is fetching and also triggers the fetch

## SET_QUESTION_SELECTED
- action creator: setQuestionSelected
- callAPI: API_UPDATE_REPORT_SETTINGS
- return: thunk
- no reducer so there isn't really a need for the main action
- it does save some properties in the main event but they don't seem to be used

## HIDE_UNSELECTED_QUESTIONS
- action creator: hideUnselectedQuestions
- callAPI: API_UPDATE_REPORT_SETTINGS
- return: thunk
- reducer calls hideUnselectedQuestions, this looks at all unselected questions and hides them

## SHOW_UNSELECTED_QUESTIONS
- action creator: showUnselectedQuestions
- callAPI: API_UPDATE_REPORT_SETTINGS
- return: object
- reducer calls showUnselectedQuestions with the state; this updates all question to have
  hiddenByUser set to false

## SET_ANONYMOUS
- action creator: setAnonymous
- callAPI: API_UPDATE_REPORT_SETTINGS
- return: object
- fired when the teacher wants to hide or show student names
- there is also a SET_ANONYMOUS_VIEW action type, this is dispatched by fetchAndObserveData
  when there is a runKey. This is a different kind of anonymous--it means the user is running
  the report without being logged into the portal.

## API_CALL
5 action creators use this action type
They all return an object

- updateQuestionFeedback
  - callAPI: API_UPDATE_QUESTION_FEEDBACK
- updateActivityFeedback
  - callAPI: API_UPDATE_ACTIVITY_FEEDBACK
- updateQuestionFeedbackSettings
  - callAPI: API_UPDATE_FEEDBACK_SETTINGS
- updateActivityFeedbackSettings
  - callAPI: API_UPDATE_FEEDBACK_SETTINGS
- saveRubric
  - callAPI: API_UPDATE_FEEDBACK_SETTINGS

besides these action definitions there are no other references to this

## REQUEST_RUBRIC
- action creator: requestRubric
- callAPI: API_FETCH_RUBRIC
- return: thunk
- there are no other references to this type, so it doesn't seem to trigger a
  reducer or any side effects
