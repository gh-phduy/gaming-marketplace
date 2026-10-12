const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const ignored = new Set(['node_modules', '.git', '.next', '.agents', '.codex-artifacts', '.vscode', 'public']);
const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (/\.(?:ts|tsx|js|jsx)$/.test(entry.name) && !/\.(?:test|spec|d)\.tsx?$/.test(entry.name)) files.push(absolute);
  }
}
walk(root);
files.sort();

const database = [];
const auth = [];
const functions = [];
const realtime = [];
const rpc = [];
const storage = [];
function textArgument(node, source) {
  return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ? node.text : node?.getText(source) ?? null;
}
function chainTop(node) {
  let current = node;
  while (current.parent && (
    (ts.isPropertyAccessExpression(current.parent) && current.parent.expression === current) ||
    (ts.isCallExpression(current.parent) && current.parent.expression === current)
  )) current = current.parent;
  return current;
}
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const expression = node.expression.getText(source);
      const base = node.expression.expression.getText(source);
      const method = node.expression.name.text;
      const location = source.getLineAndCharacterOfPosition(node.getStart(source));
      const entry = {
        file: path.relative(root, file).split(path.sep).join('/'),
        line: location.line + 1,
        query: chainTop(node).getText(source),
      };
      const isPaymentClient = entry.file === 'lib/payments/server.ts' && /^(client|db)(?:\.|$)/.test(base);
      const isImageClient = entry.file === 'app/api/listings/image/route.ts' && /^(authClient|admin)(?:\.|$)/.test(base);
      if (/^supabase(?:Admin)?(?:\.|$)/.test(base) || isPaymentClient || isImageClient) {
        if (method === 'from') {
          entry.table = textArgument(node.arguments[0], source);
          if (base.includes('.storage')) storage.push(entry);
          else {
            const operation = entry.query.match(/\.(insert|upsert|update|delete|select)\(/);
            entry.operation = operation?.[1] ?? 'unknown';
            database.push(entry);
          }
        } else if (method === 'rpc') {
          rpc.push({ ...entry, name: textArgument(node.arguments[0], source) });
        } else if (base.includes('.auth')) {
          auth.push({ ...entry, method: expression.replace(/^supabase(?:Admin)?\./, '') });
        } else if (base === 'supabase.functions' && method === 'invoke') {
          functions.push({ ...entry, name: textArgument(node.arguments[0], source) });
        }
      }
      if (method === 'on' && textArgument(node.arguments[0], source) === 'postgres_changes') {
        const options = node.arguments[1];
        const values = {};
        if (options && ts.isObjectLiteralExpression(options)) {
          for (const property of options.properties) {
            if (ts.isPropertyAssignment(property)) {
              values[property.name.getText(source)] = textArgument(property.initializer, source);
            }
          }
        }
        realtime.push({ ...entry, ...values });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
const inventory = {
  scannedProductionSourceFiles: files.map(file => path.relative(root, file).split(path.sep).join('/')),
  summary: {
    sourceFiles: files.length,
    tableQuerySites: database.length,
    tables: [...new Set(database.map(entry => entry.table))].sort(),
    authCallSites: auth.length,
    edgeFunctionCallSites: functions.length,
    realtimeSubscriptions: realtime.length,
    rpcCallSites: rpc.length,
    storageCallSites: storage.length,
  },
  database, auth, functions, realtime, rpc, storage,
};
const output = path.join(root, 'supabase/query-inventory.json');
fs.writeFileSync(output, JSON.stringify(inventory, null, 2) + '\n');
console.log(JSON.stringify(inventory.summary, null, 2));
