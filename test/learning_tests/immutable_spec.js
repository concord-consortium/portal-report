import { expect} from 'chai'
import { List } from "immutable"


describe('Immutability', () => {
  describe('a number', () => {
    function increment(state) {
      return state + 1
    }
    it("is immutable", () => {
      let state= 42
      let nextState = increment(state)
      expect(nextState).to.equal(43);
      expect(state).to.equal(42);
    })
  })
  describe('a List', () => {
    let state = List([1,2,3])
    let nextState = state.push(4)
    expect(nextState).to.equal(
      List.of(1,2,3,4)
    )
    expect(state).to.equal(
      List.of(1,2,3)
    )
  })
})
