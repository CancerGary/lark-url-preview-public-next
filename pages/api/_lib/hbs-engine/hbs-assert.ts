/* c8 ignore start */
export function isProgram(node: hbs.AST.Node): node is hbs.AST.Program {
  return node.type === "Program";
}

export function isMustacheStatement(
  node: hbs.AST.Node,
): node is hbs.AST.MustacheStatement {
  return node.type === "MustacheStatement";
}
export function isBlockStatement(
  node: hbs.AST.Node,
): node is hbs.AST.BlockStatement {
  return node.type === "BlockStatement";
}
export function isPartialStatement(
  node: hbs.AST.Node,
): node is hbs.AST.PartialStatement {
  return node.type === "PartialStatement";
}
export function isPartialBlockStatement(
  node: hbs.AST.Node,
): node is hbs.AST.PartialBlockStatement {
  return node.type === "PartialBlockStatement";
}
export function isContentStatement(
  node: hbs.AST.Node,
): node is hbs.AST.ContentStatement {
  return node.type === "ContentStatement";
}
export function isCommentStatement(
  node: hbs.AST.Node,
): node is hbs.AST.CommentStatement {
  return node.type === "CommentStatement";
}
export function isSubExpression(
  node: hbs.AST.Node,
): node is hbs.AST.SubExpression {
  return node.type === "SubExpression";
}
export function isPathExpression(
  node: hbs.AST.Node,
): node is hbs.AST.PathExpression {
  return node.type === "PathExpression";
}
export function isStringLiteral(
  node: hbs.AST.Node,
): node is hbs.AST.StringLiteral {
  return node.type === "StringLiteral";
}
export function isBooleanLiteral(
  node: hbs.AST.Node,
): node is hbs.AST.BooleanLiteral {
  return node.type === "BooleanLiteral";
}
export function isNumberLiteral(
  node: hbs.AST.Node,
): node is hbs.AST.NumberLiteral {
  return node.type === "NumberLiteral";
}
export function isUndefinedLiteral(
  node: hbs.AST.Node,
): node is hbs.AST.UndefinedLiteral {
  return node.type === "UndefinedLiteral";
}
export function isNullLiteral(node: hbs.AST.Node): node is hbs.AST.NullLiteral {
  return node.type === "NullLiteral";
}
export function isHash(node: hbs.AST.Node): node is hbs.AST.Hash {
  return node.type === "Hash";
}
export function isHashPair(node: hbs.AST.Node): node is hbs.AST.HashPair {
  return node.type === "HashPair";
}
