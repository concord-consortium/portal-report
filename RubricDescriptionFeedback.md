
# Student rubric feedback will now display in a grid.

A new pure and stateless React component has been started `rubric-box-for-student`. Right now it does not have the correct appearance.  It uses a new class `rubric-helper` to work out what to display.

## Student rubric feedback will display `ratingDescriptions`

Each row in the grid will display the student results for a particular critereon.
The fist column will describe the critereon, and the second will describe the students rating.

In the JSON structure for the rubric defines a `criteria` and `ratings` section.
At the intersection of `criteria[1]` and `rating[2]` is a `ratingDescription`.  
These rating descriptions are nested under the `criteria[1]` in JSON it looks like this:


```
            …
            "ratingDescriptions": {
                "R1": "Student provides reasoning that …",
                "R2": "Studentdescribes predator-prey …",
                "R3": "Student does not provide reasoning …"
            }
            …

```

## Student rubric feedback may display alternate descriptions by using `ratingDescriptions_student`

The above rating descriptions look to 'teacher-centric'.  So if the rubric author so wishes, they can specify feedback which is specifically oriented to the student, using an adjacent field in the JSON called `ratingDescriptions_student` eg:

```json
            …
            "ratingDescriptions": {
                "R1": "Student provides reasoning that …",
                "R2": "Student describes predator-prey …",
                "R3": "Student does not provide reasoning …"
            },
            "ratingDescriptions_student": {
                "R1": "You provided reasoning that …",
                "R2": "You described predator-prey …",
                "R3": "You did not show me your reasoning"
            },
            …

```

Using the `util/rubric_helper.js` class, you can ask for feedback results formatted for presentation to students specifically.

## Tests

There is a `test/rubric-helper_spec.js` mocha test that attempts to test and document the `rubric-helper` class. All the mocha tests can be run continuously by running `npm run test:watch`

## Sample Data

The mocha test, and manual browser test at http://localhost:8080/rubric-test.html use sample rubric data that you can find in  `public/sample-rubric.json` and `public/sample-rubric-feedback.json`

## Future work:


#### Table layout,

As mentioned before the `rubric-box-for-student` is not complete. It just uses the helper and the new description fields. Work needs to continue so that the feedback is displayed in a table. The goals is that each criteria description shows up in the left side, and the students rating description shows up on the right.

#### More student-centric descriptions and labels.


The rubric JSON defines a `description` field for each of the `criteria` elements too. We will want to extend the pattern we are using in the `rubric-helper` to be able to conditionally extract `description_student` from each criteria definition. The pattern of appending "**`_student`**" to field names will provide us a with an obvious naming convention.

Here is an example:

```json
      "criteria": [
          {
            "id": "C1",
            "description": "Student must supported claims by evidence …",
            "description_student": "You must make a claimm, and  support it w/ evidence …",
            "ratingDescriptions": { … },
            "ratingDescriptions_student": { … }
          },
          …
      ]
```