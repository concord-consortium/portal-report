import React, { PureComponent } from 'react'
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


const NonApplicableRatings = ({name, values, setFieldValue}) => {
  const ratings = values.ratings
  const nonApplicableRatings = getIn(values, `${name}.nonApplicableRatings`, [])

  const nonApplicableRatingSelection = ratings.map((rating, index) => {
    const checked = nonApplicableRatings.indexOf(rating.id) > -1
    const valuePath = `${name}.nonApplicableRatings.${index}`
    const setValue = e => {
      const newValue = e.target.checked ? rating.id : ''
      setFieldValue(valuePath, newValue)
    }
    return (
      <span className='inline-checkbox'>
        {rating.id}: &nbsp;
        <input
          type='checkbox'
          checked={checked}
          onChange={setValue}
        />
      </span>
    )
  })
  return (
    <div>
      <h4>non-applicable rating ids: </h4>
      <div className='ratings-list'>
        {nonApplicableRatingSelection}
      </div>
    </div>
  )
}

const RatingDescriptions = ({name, values, setFieldValue}) => {
  const ratings = values.ratings
  const nonApplicableRatings = getIn(values, `${name}.nonApplicableRatings`, [])
  const ratingDescriptions = ratings.map((rating, index) => {
    const descriptionName = `${name}.ratingDescriptions.${rating.id}`
    const descriptionValue = getIn(values, descriptionName, 'description')
    const setValue = v => setFieldValue(descriptionName, v)
    if (nonApplicableRatings.indexOf(rating.id) === -1) {
      return (
        <div key={index}>
          <span className='rating-header'>Description for {rating.id}:{rating.label}</span>
          <MarkdownField value={descriptionValue} setValue={setValue} />
        </div>
      )
    }
    return ''
  })
  return (
    <div>
      <h4>Rating descriptions: </h4>
      <div className='ratings-list'>
        {ratingDescriptions}
      </div>
    </div>
  )
}

const RatingDescriptionsForStudent = ({name, values, setFieldValue}) => {
  const ratings = values.ratings
  const key = `${name}.ratingDescriptionsForStudent`
  const nonApplicableRatings = getIn(values, `${name}.nonApplicableRatings`, [])
  let hasForStudent = getIn(values, key)
  // hasForStudent = hasForStudent && Object.keys(hasForStudent).length > 0
  if (hasForStudent) {
    const ratingDescriptions = ratings.map((rating, index) => {
      const descriptionName = `${key}.${rating.id}`
      const descriptionValue = getIn(values, descriptionName, 'description')
      const setValue = v => setFieldValue(descriptionName, v)
      if (nonApplicableRatings.indexOf(rating.id) === -1) {
        return (
          <div key={index}>
            <span className='rating-header'>STUDENT description for {rating.id}:{rating.label}</span>
            <MarkdownField value={descriptionValue} setValue={setValue} />
          </div>
        )
      } else {
        return ''
      }
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
  const studentDescriptionName = `${name}.descriptionForStudent`
  const setDescription = v => setFieldValue(descriptionName, v)
  const setStudentDescription = v => {
    // if (v && v.length > 0) {
    setFieldValue(studentDescriptionName, v)
    // } else {
    // setFieldValue(studentDescriptionName, null)
    // }
  }
  const descriptionValue = getIn(values, descriptionName, 'description')
  const studentDescriptionValue = getIn(values, studentDescriptionName, '')
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
          <div>
            <label>Student Description for criterion {criteriaName} </label>
            <br />( blank will use above description )
            <MarkdownField value={studentDescriptionValue} setValue={setStudentDescription} />
          </div>
        </div>
        <div className='ratings'>
          <NonApplicableRatings
            name={name}
            values={values}
            setFieldValue={setFieldValue} />
          <hr />
          <RatingDescriptions
            name={name}
            values={values}
            setFieldValue={setFieldValue} />
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

class RubricForm extends PureComponent {

  render () {
    return this.renderRubricForm()
  }

  // We try and automatically submit our form if we are unloading.
  // (Incase the author forgets to click the 'update' button)
  componentWillUnmount () {
    this.triggerSave()
  }

  triggerSave () {
    if (this.form) {
      this.form.executeSubmit()
    }
  }
  
  renderRubricForm () {
    const { rubric, updateRubric } = this.props
    return (
      <div>
        <Formik
          initialValues={rubric}
          onSubmit={updateRubric}
          ref={node => (this.form = node)}
          render={({ values, setFieldValue }) => (
            <Form>
              <div className='general-options'>
                <span />
                <h3> General options </h3>
                <label> ID: </label>
                <Field name='id' />
  
                <label> Reference URL: </label>
                <Field name='referenceURL' />
  
                <label> Show rating descriptions: </label>
                <Field
                  name='showRatingDescriptions'
                  component='input'
                  type='checkbox' checked={values.showRatingDescriptions} />

                <label> Score using points: </label>
                <Field
                  name='scoreUsingPoints'
                  component='input'
                  type='checkbox' checked={values.scoreUsingPoints} />
  
                <label> Criteria label:</label>
                <Field name='criteriaLabel' />
  
                <label> Criteria Label for student: </label>
                <Field name='criteriaLabelForStudent' />
  
                <label> Fiedback label for students: </label>
                <Field name='feedbackLabelForStudent' />
  
              </div>

              <div className='rating-section'>
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
              </div>

              <h2> Criteria </h2>
              <FieldArray
                name='criteria'
                render={arrayHelpers => (
                  <div>
                    <button
                      className='add'
                      onClick={e => arrayHelpers.push({
                        id: 'C-next',
                        description: 'new criteon',
                        ratingDescriptions: {},
                        nonApplicableRatings: []
                      })}>
                    +
                    </button>
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
              <button className='big' type='submit'>Update</button>
            </Form>
          )}
        />
      </div>
    )
  }
}

export default RubricForm
