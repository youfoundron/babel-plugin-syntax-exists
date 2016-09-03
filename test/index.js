import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { expect } from 'chai'
import syntax_exists from '../src'
import { transformFileSync, transformFile } from 'babel-core'

function testTransformation(actual, expected) {
  let actual_val, expected_val

  try {
    actual_val = eval(actual)
    expected_val = eval(expected)
  } catch(err) {
    console.log("    Cannot transform the src!")
    expect(eval(actual)).to.not.throw(Error)
  }

  console.log(
    `    (${actual_val} === ${expected_val}) // =>`,
    actual_val === expected_val
  )
  expect(actual_val).to.equal(expected_val)
}

describe('BabelSyntaxExistsPluginTest', () => {
  const fixtures_dir = path.join(__dirname, 'fixtures')
  const options = { presets: ['es2015'], plugins: [syntax_exists] }

  fs.readdirSync(fixtures_dir).map((case_name) => {
    it(`should ${case_name.split('-').join(' ')}`, () => {
      // paths
      const fixture_dir = path.join(fixtures_dir, case_name)
      const actual_path = path.join(fixture_dir, 'actual.js')
      const expected_path = path.join(fixture_dir, 'expected.js')
      // scripts
      const actual = transformFileSync(actual_path, options).code
      const expected = fs.readFileSync(expected_path).toString()
      // Test it!
      testTransformation(actual, expected)
    })
  })
})
