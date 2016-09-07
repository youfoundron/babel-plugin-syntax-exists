// Babylon AST node types
// https://github.com/babel/babylon/blob/master/ast/spec.md

// Types
// https://github.com/babel/babel/tree/master/packages/babel-types

module.exports = ({ types: t }) => {

  /**
  * Returns a BinaryExpression comparing one expression against another
  *
  * @param {Expression} comparate_left The Expression we are comparing against
  * @param {Expression} comparate_right The Expression we are comparing
  * @returns {BinaryExpression}
  */
  function isExp(comparate_left, comparate_right) {
    return t.binaryExpression(
      "===",
      comparate_left,
      comparate_right
    )
  }

  /**
  * Returns a BinaryExpression comparing one expression against another
  *
  * @param {Expression} comparate_left The Expression we are comparing against
  * @param {Expression} comparate_right The Expression we are comparing
  * @returns {BinaryExpression}
  */
  function isNotExp(comparate_left, comparate_right) {
    return t.binaryExpression(
      "!==",
      comparate_left,
      comparate_right
    )
  }

  /**
   * Returns a BinaryExpression comparing the typeof an Expression against a String
   *
   * @param {Expression} path The Expression destructured to get its' object property
   * @param {String} type_string The String we will compare against
   * @returns {BinaryExpression}
   */
  function isTypeofExp({ node: {object} }, type_string) {
    return isExp(
      t.unaryExpression("typeof", object, false),
      t.stringLiteral(type_string)
    )
  }

  /**
   * Returns a BinaryExpression comparing the typeof an Expression against a String
   *
   * @param {Expression} path The Expression destructured to get its' object property
   * @param {String} type_string The String we will compare against
   * @returns {BinaryExpression}
   */
  function isNotTypeofExp({ node: {object} }, type_string) {
    return isNotExp(
      t.unaryExpression("typeof", object, false),
      t.stringLiteral(type_string)
    )
  }

  /**
   * Returns a BinaryExpression comparing the typeof an Expression against "undefined"
   *
   * @param {Expression} path The Expression to be passed to isNotTypeofExp
   * @returns {BinaryExpression}
   */
  function isNotTypeUndefinedExp(path) {
    return isNotTypeofExp(path, "undefined")
  }

  /**
   * Returns a BinaryExpression comparing the typeof an Expression against "null"
   *
   * @param {Expression} path The Expression to be passed to isNotTypeofExp
   * @returns {BinaryExpression}
   */
  function isNotNullExp({ node: {object} }) {
    return isNotExp(object, t.nullLiteral())
  }

  /**
   * Returns a BinaryExpression comparing the typeof an Expression against "function"
   *
   * @param {Expression} path The Expression to be passed to isNotTypeofExp
   * @returns {BinaryExpression}
   */
  function isTypeFunction(path) {
    return isTypeofExp(path, "function")
  }

  /**
   * Returns a LogicalExpression using the "&&" operator
   * to determine that the typeof an Expression is neither "null" nor "undefined"
   *
   * @param {Expression} path The Expression to be used for comparison
   * @returns {LogicalExpression}
   */
  function isNotTypeUndefinedAndNotNullExp(path) {
    return t.logicalExpression(
      "&&",
      isNotTypeUndefinedExp(path),
      isNotNullExp(path)
    )
  }

  /**
   * Returns a LogicalExpression using the "&&" operator
   * to determine that the typeof an Expression
   * is neither "null" nor "undefined" nor "function"
   *
   * @param {Expression} path The Expression to be used for comparison
   * @returns {LogicalExpression}
   */
  function isNotTypeUndefinedAndNotNullAndTypeFunctionExp(path) {
    return t.logicalExpression(
      "&&",
      isNotTypeUndefinedAndNotNullExp(path),
      isTypeFunction(path)
    )
  }

  /**
   * Returns a Boolean value representing
   * the existence of a parent for the passed Expression
   *
   * @param {Expression} path The Expression to check for a parent on
   * @returns {Boolean}
   */
  function parentExists(path) {
    return Boolean(path.parent)
  }

  /**
   * Returns a Boolean value representing
   * the existence of a child for the passed Expression
   *
   * @param {Expression} path The Expression to check for a child on
   * @returns {Boolean}
   */
  function childExists(path) {
    return Boolean(path.parent.property)
  }

  /**
   * Returns a Boolean value representing
   * the existence of a calling parent
   *
   * @param {Expression} path The Expression to check for a calling parent on
   * @returns {Boolean}
   */
  function isCallee(path) {
    return Boolean(path.parent.type === "CallExpression")
  }

  /**
   * MemberExpression:
   * test, consequent and alternate expression factories
   */
  function testMemberExp(path) {
    return isNotTypeUndefinedAndNotNullExp(path)
  }

  function consequentMemberExp(path) {
    return (childExists(path))
      ? path.node.object
      : t.booleanLiteral(true)
  }

  function alternativeMemberExp(path) {
    return t.booleanLiteral(false)
  }

  /**
   * CallExpression:
   * test, consequent and alternate expression factories
   */
  function testCallExp(path) {
    return isNotTypeUndefinedAndNotNullAndTypeFunctionExp(path)
  }

  function consequentCallExp(path) {
    return t.callExpression(path.node.object, path.parent.arguments)
  }

  function alternativeCallExp(path) {
    return t.booleanLiteral(false)
  }

  /**
   * Computed:
   * test, consequent, alternate and existential expression factories
   */
  function testExpression(path) {
    return (isCallee(path))
      ? testCallExp(path)
      : testMemberExp(path)
  }

  function consequentExpression(path) {
    return (isCallee(path))
      ? consequentCallExp(path)
      : consequentMemberExp(path)
  }

  function alternativeExpression(path) {
    return (isCallee(path))
      ? alternativeCallExp(path)
      : alternativeMemberExp(path)
  }

  function existentialExpression(path) {
    return t.conditionalExpression(
      testExpression(path),
      consequentExpression(path),
      alternativeExpression(path)
    )
  }

  /**
   * Return a visitor that takes replaces Expressions named "ex"
   * with appropriate computed existential checks
   */
  return {
    visitor: {

      MemberExpression(path) {
        const name = path.node.property.name
        if (name === "ex") {
          const path_to_replace = (isCallee(path)) ? path.parentPath : path
          path_to_replace.replaceWith( existentialExpression(path) )
        }
      }

    }
  }
}
