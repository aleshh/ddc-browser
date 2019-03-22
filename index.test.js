import DDC from './index'

const ddc = new DDC()

describe('search', () => {
  test('search returns empty array for garbage input', () => {
    const searchTerm = 'italy'
    const results = ddc.search(searchTerm)
    // console.log(results)
  })
  test('search returns correct results for typical input', () => {
    const searchTerm = 'recipes'
    const expectedResults =  [ [
      { id: '6xx', number: '600', description: 'Technology (Applied sciences)' },
      { id: '64x', number: '640', description: 'Home economics and family living' },
      { id: '641', number: '641', description: 'Food and drink' },
      { id: '641.5', number: '641.5', description: 'Cooking, recipes' }
    ] ]
    const results = ddc.search(searchTerm)
    expect(results).toEqual(expectedResults)
  })
})
describe('retrieve', () => {
  test('retrieve typical results', () => {
    const location = '11x'
    const expectedResults = [
      [ { id: '1xx', number: '100', description: 'Philosophy and Psychology' },
        { id: '11x', number: '110', description: 'Metaphysics' },
        { id: '110', number: '110', description: 'Metaphysics' } ],
      [ { id: '111', number: '111', description: 'Ontology' } ],
      [ { id: '113', number: '113', description: 'Cosmology' } ],
      [ { id: '114', number: '114', description: 'Space' } ],
      [ { id: '115', number: '115', description: 'Time' } ],
      [ { id: '116', number: '116', description: 'Change' } ],
      [ { id: '117', number: '117', description: 'Structure' } ],
      [ { id: '118', number: '118', description: 'Force and energy' } ],
      [ { id: '119', number: '119', description: 'Number and quantity' } ]
    ]
    const results = ddc.retrieve(location)
    expect(results).toEqual(expectedResults)
  })
})