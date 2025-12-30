/**
 * ESLint plugin "local": rule no-impure-render
 */

const MUTATING_ARRAY_METHODS = new Set([
  'sort',
  'reverse',
  'splice',
  'push',
  'pop',
  'shift',
  'unshift',
  'copyWithin',
  'fill',
]);

const ASYNC_OR_NETWORK = new Set(['fetch', 'setTimeout', 'setInterval', 'requestAnimationFrame']);

const GLOBAL_IMPURE_OBJECTS = new Set(['window', 'document', 'location', 'navigator']);

function getCalleeName(node) {
  if (!node) return null;
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'MemberExpression' && !node.computed) {
    const obj = node.object?.type === 'Identifier' ? node.object.name : null;
    const prop = node.property?.type === 'Identifier' ? node.property.name : null;
    if (obj && prop) return `${obj}.${prop}`;
    if (prop) return prop;
  }
  return null;
}

function isInsideFunctionComponentOrRender(context, node) {
  const sourceCode = context.getSourceCode();

  function hasJSXReturn(fnNode) {
    const body = fnNode.body;
    if (!body || body.type !== 'BlockStatement') return false;
    for (const stmt of body.body) {
      if (stmt.type === 'ReturnStatement' && stmt.argument) {
        const arg = stmt.argument;
        if (arg.type === 'JSXElement' || arg.type === 'JSXFragment') return true;
        const text = sourceCode.getText(arg);
        if (text.includes('<') && text.includes('>')) return true;
      }
    }
    return false;
  }

  let cur = node;
  while (cur) {
    if (
      cur.type === 'FunctionDeclaration' ||
      cur.type === 'FunctionExpression' ||
      cur.type === 'ArrowFunctionExpression'
    ) {
      return hasJSXReturn(cur);
    }
    cur = cur.parent;
  }
  return false;
}

const ruleNoImpureRender = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow impure/side-effectful operations during React render.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowlistCallees: { type: 'array', items: { type: 'string' } },
          blocklistCallees: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noMutate: 'Do not mutate data during render ({{name}}). Create a copy first (e.g., [...arr].sort()).',
      noAsync: 'Do not perform async/network/timer work during render ({{name}}). Move to useEffect or server actions.',
      noGlobal: 'Do not access global mutable browser APIs during render ({{name}}). Read in effect or event handler.',
      noWrite: 'Do not cause state/navigation writes during render ({{name}}). Move to useEffect or event handler.',
    },
  },

  create(context) {
    const opts = context.options?.[0] || {};
    const allowlist = new Set(opts.allowlistCallees || []);
    const blocklist = new Set(opts.blocklistCallees || []);

    function report(node, messageId, data) {
      context.report({ node, messageId, data });
    }

    return {
      CallExpression(node) {
        if (!isInsideFunctionComponentOrRender(context, node)) return;

        const callee = node.callee;
        const calleeName = getCalleeName(callee);

        if (calleeName && allowlist.has(calleeName)) return;

        if (calleeName && blocklist.has(calleeName)) {
          report(node, 'noWrite', { name: calleeName });
          return;
        }

        if (callee.type === 'Identifier' && ASYNC_OR_NETWORK.has(callee.name)) {
          report(node, 'noAsync', { name: callee.name });
          return;
        }

        if (callee.type === 'Identifier' && callee.name === 'Promise') {
          report(node, 'noAsync', { name: 'Promise' });
          return;
        }

        if (callee.type === 'MemberExpression' && !callee.computed) {
          const prop = callee.property?.type === 'Identifier' ? callee.property.name : null;
          const objIdent = callee.object?.type === 'Identifier' ? callee.object.name : null;

          if (prop && MUTATING_ARRAY_METHODS.has(prop)) {
            report(node, 'noMutate', { name: prop });
            return;
          }

          if (prop && (prop === 'then' || prop === 'catch' || prop === 'finally')) {
            report(node, 'noAsync', { name: prop });
            return;
          }

          if (prop && (prop === 'push' || prop === 'replace') && objIdent && objIdent.toLowerCase().includes('router')) {
            report(node, 'noWrite', { name: `${objIdent}.${prop}` });
            return;
          }
        }
      },

      MemberExpression(node) {
        if (!isInsideFunctionComponentOrRender(context, node)) return;
        if (node.computed) return;

        const obj = node.object?.type === 'Identifier' ? node.object.name : null;
        if (obj && GLOBAL_IMPURE_OBJECTS.has(obj)) {
          report(node, 'noGlobal', { name: obj });
        }
      },
    };
  },
};

module.exports = {
  rules: {
    'no-impure-render': ruleNoImpureRender,
  },
};
