import { expect } from 'chai'
import { describe, it } from 'mocha'
import fs from 'fs'
import migrate, {LastVersion} from '../../js/core/rubric-migrations'
const exampleRubricPath = './public/sample-rubric.json'

describe('the migrating rubric', () => {
  const originalVersion = '1.0.0'
  const rubric = JSON.parse(fs.readFileSync(exampleRubricPath))
  const migrated = migrate(JSON.parse(fs.readFileSync(exampleRubricPath)))

  it('Should read the example rubric', () => {
    expect(rubric).to.have.property('criteria')
  })

  describe('the version number', () => {
    expect(rubric.version).to.eql(originalVersion)
    expect(migrated.version).to.eql(LastVersion)
  })

  describe('criteria.nonApplicableRatings', () => {

    describe('the original rubric json should be sparse', () => {
      const na = rubric.criteria[0].nonApplicableRatings
      expect(na.length).to.eql(1)
    })

    describe('the current rubric json should include values for all ratings', () => {
      const na = migrated.criteria[0].nonApplicableRatings
      const expectedLength = rubric.ratings.length
      expect(na.length).to.eql(expectedLength)
    })
  })
})
