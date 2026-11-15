// Stub for Phase 0: validates nothing yet. The Zod schema (src/content/schema.ts)
// and the real checks arrive in Phase 1.
const { readdirSync } = require('node:fs');

const files = readdirSync('content').filter((name) => name.endsWith('.json'));
console.log(
  `validate:content – ${files.length} content file(s) found, schema check not yet implemented.`,
);
