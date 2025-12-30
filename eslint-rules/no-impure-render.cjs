const MUTATING_ARRAY_METHODS = new Set([
  "sort","reverse","splice","push","pop","shift","unshift","copyWithin","fill"
]);

const ASYNC = new Set(["fetch","setTimeout","setInterval","Promise"]);
const GLOBALS = new Set(["window","document","location","navigator"]);

function isRender(context, node) {
  let cur = node;
  while (cur) {
    if (
      cur.type === "FunctionDeclaration" ||
      cur.type === "FunctionExpression" ||
      cur.type === "ArrowFunctionExpression"
    ) return true;
    cur = cur.parent;
  }
  return false;
}

module.exports = {
  meta: {
    type: "problem",
    messages: {
      mutate: "Do not mutate data during render.",
      async: "Do not perform async work during render.",
      global: "Do not access global browser APIs during render.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!isRender(context, node)) return;
        const name = node.callee?.property?.name || node.callee?.name;
        if (MUTATING_ARRAY_METHODS.has(name)) {
          context.report({ node, messageId: "mutate" });
        }
        if (ASYNC.has(name)) {
          context.report({ node, messageId: "async" });
        }
      },
      MemberExpression(node) {
        if (!isRender(context, node)) return;
        const obj = node.object?.name;
        if (GLOBALS.has(obj)) {
          context.report({ node, messageId: "global" });
        }
      },
    };
  },
};