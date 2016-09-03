import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { expect } from 'chai'
import syntax_exists from '../src'
import { transformFileSync, transformFile } from 'babel-core'

function testTransformation(actual, expected) {
  const actual_val = eval(actual)
  const expected_val = eval(expected)
  console.log("ACTUAL:", actual_val, actual)
  console.log("EXPECTED:", expected_val, expected)
  expect(actual_val).to.equal(expected_val)
}

describe('BabelSyntaxExistsPluginTest', () => {
  const fixtures_dir = path.join(__dirname, 'fixtures')
  const options = { presets: ['es2015'], plugins: [syntax_exists] }

  fs.readdirSync(fixtures_dir).map((case_name) => {
    it(`should ${case_name.split('-').join(' ')}`, () => {
      // Test Paths
      const fixture_dir = path.join(fixtures_dir, case_name)
      const actual_path = path.join(fixture_dir, 'actual.js')
      const expected_path = path.join(fixture_dir, 'expected.js')
      // Test code
      const actual = transformFileSync(actual_path, options).code
      const expected = fs.readFileSync(expected_path).toString()
      // Test it!
      testTransformation(actual, expected)
    })
  })
})
