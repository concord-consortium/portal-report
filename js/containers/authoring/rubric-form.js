import React from 'react'
import { Formik, Form, Field, FieldArray, getIn } from 'formik'
import ReactMde from 'react-mde'
import Markdown from 'markdown-to-jsx'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import '../../../css/authoring/form.css'
import 'react-mde/lib/styles/css/react-mde-all.css'

const RemoveButton = ({remove}) => (
  <button className='remove' type='button' onClick={remove}> - </button>
)

const Rating = ({name, remove}) => (
  <div>
    <Field name={`${name}.id`} />
    <Field name={`${name}.label`} />
    <Field name={`${name}.score`} />
    <RemoveButton remove={remove} />
  </div>
)

const MarkdownField = ({value, setValue}) => {
  return (
    <div className='markdown-field'>
      <Tabs>
        <TabList>
          <Tab> Editor </Tab>
          <Tab> Preview </Tab>
        </TabList>
        <TabPanel>
          <ReactMde
            className='md-editor'
            value={value}
            onChange={setValue}
            onTabChange={v => null}
          />
        </TabPanel>
        <TabPanel>
          <Markdown className='md-preview'>
            {value}
          </Markdown>
        </TabPanel>
      </Tabs>
    </div>
  )
}

const RatingDescriptions = ({name, values, setFieldValue}) => {
  const ratings = values.ratings
  return ratings.map((rating, index) => {
    const descriptionName = `${name}.ratingDescriptions.${rating.id}`
    const descriptionValue = getIn(values, descriptionName, 'description')
    const setValue = v => setFieldValue(descriptionName, v)
    const ratingDescriptions = (
      <div key={rating.id}>
        <span className='rating-header'>Description for {rating.id}:{rating.label}</span>
        <MarkdownField value={descriptionValue} setValue={setValue} />
      </div>
    )
    return (
      <div>
        <h4>Rating descriptions: </h4>
        <div className='ratings-list'>
          {ratingDescriptions}
        </div>
      </div>
    )
  })
}

const RatingDescriptionsForStudent = ({name, values, setFieldValue}) => {
  const ratings = values.ratings
  const key = `${name}.ratingDescriptionsForStudent`
  let hasForStudent = getIn(values, key)
  // hasForStudent = hasForStudent && Object.keys(hasForStudent).length > 0
  if (hasForStudent) {
    const ratingDescriptions = ratings.map((rating, index) => {
      const descriptionName = `${key}.${rating.id}`
      const descriptionValue = getIn(values, descriptionName, 'description')
      const setValue = v => setFieldValue(descriptionName, v)
      return (
        <div key={rating.id}>
          <span className='rating-header'>STUDENT description for {rating.id}:{rating.label}</span>
          <MarkdownField value={descriptionValue} setValue={setValue} />
        </div>
      )
    })
    return (
      <div>
        <h4>Rating descriptions for students: </h4>
        <button
          onClick={(e) => setFieldValue(key, null)}
          className='remove-wide'>
          Remove student descriptions
        </button>
        <div className='ratings-list'>
          {ratingDescriptions}
        </div>
      </div>
    )
  }
  const addStudentRatingDescriptions = () => {
    ratings.forEach((rating) => {
      const descriptionName = `${key}.${rating.id}`
      const value = `student description for ${rating.id} ${rating.label}`
      setFieldValue(descriptionName, value)
    })
  }
  return (
    <button
      onClick={addStudentRatingDescriptions}
      className='add-wide'>
      Add student descriptions
    </button>
  )
}

const Criteria = ({name, remove, values, setFieldValue}) => {
  const descriptionName = `${name}.description`
  const setDescription = v => setFieldValue(descriptionName, v)
  const descriptionValue = getIn(values, descriptionName, 'description')
  const criteriaName = getIn(values, `${name}.id`)
  return (
    <div>
      <RemoveButton remove={remove} />
      <span className='criteria-header'>{criteriaName}</span>
      <div className='criteria' >
        <div className='criterion-description'>
          <label>
            Criterion ID:
            <Field name={`${name}.id`} />
          </label>
          <div>
            <label>Description for criterion {criteriaName} </label>
            <MarkdownField value={descriptionValue} setValue={setDescription} />
          </div>
        </div>
        <div className='ratings'>
          <RatingDescriptions name={name} values={values} setFieldValue={setFieldValue} />
          <hr />
          <RatingDescriptionsForStudent
            name={name}
            values={values}
            setFieldValue={setFieldValue} />
        </div>
      </div>
    </div>
  )
}

const RubricForm = (props) => {
  const { rubric, updateRubric } = props
  return (
    <div>
      <Formik
        initialValues={rubric}
        onSubmit={updateRubric}
        render={({ values, setFieldValue }) => (
          <Form>
            <button class='big' type='submit'>Update</button>
            <h3> General options </h3>

            <label>
              Show rating descriptions:
              <Field
                name='showRatingDescriptions'
                component='input'
                type='checkbox' checked={values.showRatingDescriptions} />
            </label><br />

            <label>
              Score using points:
              <Field
                name='scoreUsingPoints'
                component='input'
                type='checkbox' checked={values.scoreUsingPoints} />
            </label><br />

            <label>
              Criteria label:
              <Field name='criteriaLabel' />
            </label><br />

            <label>
              Criteria Label for student:
              <Field name='criteriaLabelForStudent' />
            </label><br />

            <label>
              Fiedback label for students:
              <Field name='feedbackLabelForStudent' />
            </label><br />

            <h3> Ratings </h3>
            <FieldArray
              name='ratings'
              render={arrayHelpers => (
                <div>
                  <button
                    className='add'
                    onClick={e => arrayHelpers.push({id: 'R-next', label: 'label', score: 0})}>
                  +
                  </button>
                  { values.ratings.map((rating, index) => (
                    <Rating
                      name={`ratings.${index}`}
                      key={index}
                      remove={() => arrayHelpers.remove(index)} />
                  ))}
                </div>
              )}
            />
            <h2> Criteria </h2>
            <FieldArray
              name='ratings'
              render={arrayHelpers => (
                <div>
                  { values.criteria.map((criteria, index) => (
                    <Criteria
                      name={`criteria.${index}`}
                      key={index}
                      values={values}
                      setFieldValue={setFieldValue}
                      remove={() => arrayHelpers.remove(index)} />
                  ))}
                </div>
              )}
            />
          </Form>
        )}
      />
    </div>
  )
}

export default RubricForm
