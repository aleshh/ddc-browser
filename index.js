import ddcIndex from './ddcIndex.json'
import { debug } from 'util';

/**
 * Methods for retrieving results from a catalog of the Dewey Decimal
 * Classification system.
 */
class Ddc {

  /**
   * Searches the DDC and returns any entry that matches the string, either in
   * the class number or the description string.
   * @param {string} number - A string with a 3-digit number, optionally with
   *   some digits of the number replaced by 'x'
   * @param {array} index - Defaults to the DDC. You probably don't want to
   *   pass anything here; it's a parameter becasue the function is recursive.
   * @returns {array} of arrays of objects of DDC classes. These will always be
   *   only from one level of the heiarchy. In each array the last item is the
   *   result, the previous items are what's above it in the heiarchy.
   */
  search (searchTerm, index = ddcIndex) {
    const results = []
    const searchTermLc = searchTerm.toLowerCase()

    if (searchTerm.length > 0) {
      index.forEach(entry => {
        if (entry.description.toLowerCase().includes(searchTermLc) ||
            entry.number.includes(searchTermLc)
        ) {
          results.push([entry])
        }
        if (entry.subordinates != null) {
          let subordinates = this.search(searchTerm, entry.subordinates)
          if (subordinates) {
            subordinates.forEach(result => {
              result.unshift(entry)
            })
            results.push(...subordinates)
          }
        }
      })
    }
    return (results.length > 0)
      ? cleanUpEntries(results)
      : null
  }

  /**
   * Returns a list of classes from the DDC. 'xxx' will return the main classes,
   * '1xx' will return the 10 classes under Philosophy and Psychology, etc.
   * @param {string} number - A string with a 3-digit number, optionally with
   *   some digits of the number replaced by 'x'
   * @returns {array} of arrays of objects of DDC classes. These will always be
   *   only from one level of the heiarchy. In each array the last item is the
   *   result, the previous items are what's above it in the heiarchy.
   */
  retrieve (number) {
    // test if number is three digits, optionally with some x's at the end
    // should not happen: func only gets called from inside the house
    if (!/^\d{3}$|^\d{2}x$|^\dxx$|^x{3}$/.test(number)) {
      console.error('retrieveDdc received something other than a 3-digit num')
      return
    }

    let depth
    switch (number.indexOf('x')) {
      case 2: depth = 2; break // thousands
      case 1: depth = 1; break // hundreds
      case 0: depth = 0; break // main classes
      case -1: depth = 3; break // regular numbers
      default: console.error('') // we already checked
    }

    const results = []

    // hideous tangle of nested loops. fix me! hopefully with recursion?
    ddcIndex.forEach(mainClass => {
      if (depth === 0) {
        results.push([mainClass])
      } else {
        if (number.charAt(0) === mainClass.number.charAt(0)) {
          mainClass.subordinates.forEach(hundredsClass => {
            if (depth === 1) {
              results.push([mainClass, hundredsClass])
            } else {
              if (number.charAt(1) === hundredsClass.number.charAt(1)) {
                hundredsClass.subordinates.forEach(thousandsClass => {
                  if (depth === 2) {
                    results.push([mainClass, hundredsClass, thousandsClass])
                  } else {
                    if (number.charAt(2) === thousandsClass.number.charAt(2)) {
                      thousandsClass.subordinates
                        .forEach(number => results.push(
                          [mainClass, hundredsClass, thousandsClass, number]
                        ))
                    }
                  }
                })
              }
            }
          })
        }
      }
    })
    return cleanUpEntries(results)
  }
}

/**
 * Executes several steps to remove data unnecessary data for display.
 * @param {array} rawResults - Array of results to be prepared for returning.
 * @returns {array} - Processed results ready for display.
 */
const cleanUpEntries = rawResults => {
  const pass1 = removeDuplicateHeadersFromResults(rawResults)
  const pass2 = removeBlankEntries(pass1)
  const pass3 = removeSubordinates(pass2)
  return pass3
}

/**
 * searchDdc and retrieveDdc each produce an array of arrays where the last
 * element in each inner array is the result, the previous elements are the
 * path. removes the path elements (headings) that are in the previous
 * entry
 * @param {array} results Array of arrays
 * @returns {array} Array of arrays with duplicate "headers" removed
 */
const removeDuplicateHeadersFromResults = results => {
  const filteredResults = [results[0]]

  for (let i = 1; i < results.length; i++) {
    const filteredElement = results[i].filter(element => {
      // look at the previous element and see if there are any matching id's
      const matched = results[i - 1].filter(previousElement => (
        (previousElement.id === element.id)
      ))

      return (!matched.length > 0)
    })
    filteredResults.push(filteredElement)
  }
  return filteredResults
}

/**
 * Similar to removeDuplicateHeadersFromResults(), this version removes
 * headers only if all of them are identical to the previous entry.
 * @param {array} results Array of arrays
 * @returns {array} Array of arrays with duplicate "headers" removed
 */
const removeHeadersIfUnchanged = results => {
  const filteredResults = results.map((element, i) => {
    // if the next-to-last item in the element matches the next-to-last item
    // in the previous element, remove all but the last element
    if (element[-2] === results[i - 1][-2]) {
      return element.splice(0, (element.length - 2))
    }
    return element
  })

  return filteredResults
}

const removeBlankEntries = results => (
  results.filter(entry => (
    !['', 'Unassigned'].includes(entry[entry.length - 1].description)
  ))
)

/**
 * Duplicate array of arrays while removing subordinates.
 * @param {array} results - Array of entries to be processed.
 * @returns {array} - Array of entries with subordinates removed.
 */
const removeSubordinates = results => {
  const filteredResults = results.map(item => {
    return item.map(entry => ({
      id: entry.id,
      number: entry.number,
      description: entry.description
    }))
  })
  return filteredResults
}

export default Ddc
