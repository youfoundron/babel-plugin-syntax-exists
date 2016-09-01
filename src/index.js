// Babylon AST node types
// https://github.com/babel/babylon/blob/master/ast/spec.md

// Types
// https://github.com/babel/babel/tree/master/packages/babel-types

module.exports = ({ types: t }) => {

  /**
   * Returns a BinaryExpression comparing the typeof an Expression against a String
   *
   * @param {Expression} path The Expression destructured to get its' object property
   * @param {String} type_string The String we will compare against
   * @returns {BinaryExpression}
   */
  function isNotTypeofExp({ node: {object} }, type_string) {
    return t.binaryExpression(
      "!==",
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
  function isNotUndefinedExp(path) {
    return isNotTypeofExp(path, "undefined")
  }

  /**
   * Returns a BinaryExpression comparing the typeof an Expression against "null"
   *
   * @param {Expression} path The Expression to be passed to isNotTypeofExp
   * @returns {BinaryExpression}
   */
  function isNotNullExp(path) {
    return isNotTypeofExp(path, "null")
  }

  /**
   * Returns a BinaryExpression comparing the typeof an Expression against "function"
   *
   * @param {Expression} path The Expression to be passed to isNotTypeofExp
   * @returns {BinaryExpression}
   */
  function isNotFunction(path) {
    return isNotTypeofExp(path, "function")
  }

  /**
   * Returns a LogicalExpression using the "&&" operator
   * to determine that the typeof an Expression is neither "null" nor "undefined"
   *
   * @param {Expression} path The Expression to be used for comparison
   * @returns {LogicalExpression}
   */
  function isNotUndefinedAndNotNullExp(path) {
    return t.logicalExpression(
      "&&",
      isNotUndefinedExp(path),
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
  function isNotUndefinedAndNotNullAndNotFunctionExp(path) {
    return t.logicalExpression(
      "&&",
      isNotUndefinedAndNotNullExp(path),
      isNotFunction(path)
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
    if (path.parent)
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
    return Boolean(path.parent.type !== "ExpressionStatement")
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
   * Returns a Boolean value representing
   * the existence of child accessing an Expression's scope
   *
   * @param {Expression} path The Expression to check for a child scope accessor on
   * @returns {Boolean}
   */
  function scopeIsAccessed(path) {
    return Boolean(
      parentExists(path) &&
      parentExists(path.parent) &&
      path.parent.parent.type === "MemberExpression"
    )
  }


  /**
   * MemberExpression:
   * test, consequent and alternate expression factories
   */
  function testMemberExp(path) {
    return isNotUndefinedAndNotNullExp(path)
  }

  function consequentMemberExp(path) {
    return (childExists(path))
      ? path.node.object
      : t.booleanLiteral(true)
  }

  function alternativeMemberExp(path) {
    return (childExists(path))
      ? t.unaryExpression("void", t.numericLiteral(0), false)
      : t.booleanLiteral(false)
  }

  /**
   * CallExpression:
   * test, consequent and alternate expression factories
   */
  function testCallExp(path) {
    return isNotUndefinedAndNotNullAndNotFunctionExp(path)
  }

  function consequentCallExp(path) {
    return t.callExpression(path, path.parent.arguments)
  }

  function alternativeCallExp(path) {
    return (childExists(path))
      ? t.unaryExpression("void", t.numericLiteral(0), false)
      : t.booleanLiteral(false)
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
      // testExpression(path),
      // consequentExpression(path),
      // alternativeExpression(path)
      testMemberExp(path),
      consequentMemberExp(path),
      alternativeMemberExp(path)
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
          path.replaceWith( existentialExpression(path) )
        }
      }
    }
  }
}
