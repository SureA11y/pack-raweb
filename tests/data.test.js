'use strict';

/**
 * data/ holds RAWeb's files byte for byte, with the licence the repository
 * publishes them under (CC BY 3.0 LU): each is still the git blob
 * data/README.md lists, so a file edited by hand, or replaced without
 * updating the attribution, fails here.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const DATA = path.join(__dirname, '..', 'data');

// A file's git blob id, as `git hash-object` gives it.
function blobOf(file) {
  const body = fs.readFileSync(file);
  return crypto
    .createHash('sha1')
    .update(Buffer.concat([Buffer.from(`blob ${body.length}\0`), body]))
    .digest('hex');
}

const BLOBS = {
  'fr/criteres.json': '36e41dc4a099',
  'fr/methodologies.json': '03fd123fc568',
  'fr/glossaire.json': '6e40928f4e6e',
  'fr/themes.json': '541f6a326503',
  'fr/LICENSE.md': '6842dcf35316',
  'en/criteres.json': '1e1c5dee3076',
  'en/methodologies.json': '3b1a0af15138',
  'en/glossaire.json': '39844dfd9ef9',
  'en/themes.json': 'f9967ab49b0d',
  'en/LICENSE.md': 'd7c080bbb50f'
};

test('each data file is the RAWeb file data/README.md lists, byte for byte', () => {
  const readme = fs.readFileSync(path.join(DATA, 'README.md'), 'utf8');
  for (const [file, blob] of Object.entries(BLOBS)) {
    assert.ok(blobOf(path.join(DATA, file)).startsWith(blob), `${file} is not blob ${blob}`);
    assert.ok(
      readme.includes(`\`${file}\``) && readme.includes(`\`${blob}\``),
      `README lists ${file}`
    );
  }
});

test('the licence is published with the data, and the attribution says what was changed', () => {
  assert.match(
    fs.readFileSync(path.join(DATA, 'en/LICENSE.md'), 'utf8'),
    /Creative Commons Attribution 3\.0 Luxembourg/
  );
  assert.match(
    fs.readFileSync(path.join(DATA, 'fr/LICENSE.md'), 'utf8'),
    /Creative Commons Paternité 3\.0 Luxembourg/
  );
  const readme = fs.readFileSync(path.join(DATA, 'README.md'), 'utf8');
  assert.match(readme, /Service information et presse/);
  assert.match(readme, /creativecommons\.org\/licenses\/by\/3\.0\/lu/);
  assert.match(readme, /the original work has been modified/);
  assert.match(readme, /not affiliated with, sponsored or endorsed by/);
  // RAWeb's own notice, kept as it is.
  assert.match(readme, /Copyright 2013 BrailleNet Association\. All rights reserved\./);
  for (const file of ['map.js', 'glossary.js']) {
    const head = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').slice(0, 1500);
    assert.match(head, /SPDX-License-Identifier: MPL-2\.0 AND LicenseRef-CC-BY-3\.0-LU/, file);
    assert.match(head, /The original work has been modified/, file);
    assert.match(head, /not affiliated with or endorsed by/, file);
  }
});
