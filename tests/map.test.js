'use strict';

/**
 * map.js and glossary.js: what the generator makes of RAWeb's files in data/,
 * exactly, and what RAWeb 1.1 says: 17 themes, 136 criteria (RGAA 4.1.2's 106
 * with their numbers, and 30 of its own), 304 tests.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { RAWEB_VERSIONS, RAWEB_THEMES, RAWEB_CRITERIA, RAWEB_TESTS } = require('../map');
const { RAWEB_GLOSSARY } = require('../glossary');
const { buildTables, renderModule, renderGlossary, formatted } = require('../scripts/generate-map');

const V = '1.1';

test('map.js and glossary.js are what the generator makes of data/', async () => {
  const tables = buildTables();
  const root = path.join(__dirname, '..');
  assert.equal(
    fs.readFileSync(path.join(root, 'map.js'), 'utf8'),
    await formatted(renderModule(tables))
  );
  assert.equal(
    fs.readFileSync(path.join(root, 'glossary.js'), 'utf8'),
    await formatted(renderGlossary(tables))
  );
});

test('RAWeb 1.1: 17 themes, 136 criteria, 304 tests', () => {
  assert.deepEqual(RAWEB_VERSIONS, [{ version: V, published: '2026-02', wcagVersion: '2.1' }]);
  assert.equal(RAWEB_THEMES[V].length, 17);
  assert.equal(Object.keys(RAWEB_CRITERIA[V]).length, 136);
  assert.equal(Object.keys(RAWEB_TESTS[V]).length, 304);
  for (const [id, c] of Object.entries(RAWEB_CRITERIA[V])) {
    for (const t of c.tests) assert.equal(RAWEB_TESTS[V][t].criterion, id, t);
  }
  // Every criterion names its EN 301 549 clauses, but the two on office
  // documents, as RAWeb publishes them.
  assert.deepEqual(
    Object.keys(RAWEB_CRITERIA[V]).filter((id) => !RAWEB_CRITERIA[V][id].en301549.length),
    ['13.3', '13.4']
  );
  // The tests RAWeb publishes with no methodology, and no other.
  assert.deepEqual(
    Object.entries(RAWEB_TESTS[V])
      .filter(([, t]) => !t.methodology)
      .map(([id]) => id),
    ['8.1.1', '8.2.1']
  );
  for (const [id, t] of Object.entries(RAWEB_TESTS[V])) {
    for (const anchor of t.glossary || []) assert.ok(RAWEB_GLOSSARY[V][anchor], `${id}: ${anchor}`);
  }
});
