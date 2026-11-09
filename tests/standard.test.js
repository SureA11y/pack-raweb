'use strict';

/**
 * RAWeb's standard: built on pack-rgaa's data (standard-data.js), it keeps
 * RGAA's rule map where RAWeb says what RGAA says, and changes it where
 * RAWeb differs, as docs/RULE_MAP_REVIEW.md records. Each change has a page
 * here on which pack-rgaa's link, kept as it was, would fail what RAWeb
 * accepts.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { checkStandardData, standardDataOf } = require('@surea11y/core/pack');
const { runa11yCoreOnHtml } = require('@surea11y/core/testing');
const rgaa = require('@surea11y/pack-rgaa');
const raweb = require('..');
const { STANDARD_DATA, OWN_ROWS } = require('../standard-data');
const { RAWEB_CRITERIA, RAWEB_TESTS } = require('../map');

const V = '1.1';
const data = STANDARD_DATA.data[V];
const rgaaData = standardDataOf(rgaa.standard).data['4.1.2'];

const quiet = (fn) => {
  const warn = console.warn;
  console.warn = () => {};
  try {
    return fn();
  } finally {
    console.warn = warn;
  }
};
const page = (body, doctype = '<!doctype html>') =>
  `${doctype}<html lang="fr"><head><title>Page</title></head><body>${body}</body></html>`;
const scan = (body, { profile = 'raweb-1.1', doctype } = {}) =>
  quiet(() =>
    runa11yCoreOnHtml(page(body, doctype), { engineOptions: { packs: [rgaa, raweb], profile } })
  );
// A criterion's rollup, and what each rule that didn't pass gave it.
function criterion(result, id, profile = 'raweb-1.1') {
  const roll = result.rulesResults.find((r) => r.ruleId === `${profile}-${id}`);
  const contributors = roll
    ? (roll.data.details.contributors || []).filter(
        (c) => c.outcome !== 'pass' && c.outcome !== 'notApplicable'
      )
    : [];
  return { outcome: roll ? roll.outcome : null, contributors };
}
const by = (c, rule) => c.contributors.find((x) => x.testId === rule);

test('the data is RAWeb 1.1, each criterion and test based on RGAA’s where RGAA has it', () => {
  assert.deepEqual(checkStandardData(STANDARD_DATA), []);
  assert.equal(Object.keys(data.requirements).length, 136);
  assert.equal(Object.keys(data.tests).length, 304);
  for (const [id, c] of Object.entries(data.requirements)) {
    assert.equal(c.title, RAWEB_CRITERIA[V][id].title, id);
    const based = !!rgaaData.requirements[id];
    assert.equal(!!c.basedOn, based, `${id} basedOn`);
    if (!based) assert.equal(c.partial, true, `${id}: RAWeb's own criteria are partial`);
  }
  for (const [id, t] of Object.entries(data.tests)) {
    assert.equal(!!t.basedOn, !!rgaaData.tests[id], `${id} basedOn`);
    assert.ok(t.title.startsWith(RAWEB_TESTS[V][id].title), id);
    assert.ok(t.procedure, `${id} has a procedure`);
  }
  // RGAA's 8.1.2 and 8.1.3 are not RAWeb's.
  assert.equal(data.tests['8.1.2'], undefined);
  assert.equal(data.tests['8.1.3'], undefined);
});

test('every criterion and test reads in RAWeb’s own English', () => {
  const en = data.texts.en;
  for (const id of Object.keys(data.requirements)) assert.ok(en[`requirements.${id}.title`], id);
  for (const id of Object.keys(data.tests)) {
    assert.ok(en[`tests.${id}.title`], id);
    assert.equal(
      en[`tests.${id}.procedure.steps`].length,
      data.tests[id].procedure.steps.length,
      id
    );
  }
  assert.ok(STANDARD_DATA.texts.en['laws.lu-loi-2019-05-28.name']);
});

test('where RAWeb says what RGAA says, a rule’s row is pack-rgaa’s', () => {
  for (const [rule, row] of Object.entries(rgaaData.ruleMap)) {
    if (rule in OWN_ROWS) continue;
    const reaches = [
      ...(row.requirements || []),
      ...(row.asks || []),
      ...Object.values(row.reasonCodes || {}).flatMap((r) => r.requirements || []),
      ...(row.findings || []).flatMap((f) => f.requirements || [])
    ];
    if (!reaches.length) {
      assert.equal(data.ruleMap[rule], undefined, `${rule} reaches no test, in RGAA or RAWeb`);
      continue;
    }
    assert.deepEqual(data.ruleMap[rule], row, rule);
  }
  for (const [rule, row] of Object.entries(OWN_ROWS)) {
    if (row === null) assert.equal(data.ruleMap[rule], undefined, `${rule} is dropped`);
    else assert.deepEqual(data.ruleMap[rule], row, rule);
  }
});

test('a scan names the law the profile is used for', () => {
  const r = scan('<main><p>Texte</p></main>');
  assert.equal(r.skippedPacks, undefined);
  assert.equal(r.engine.law.id, 'lu-loi-2019-05-28');
  assert.equal(r.engine.law.jurisdiction, 'LU');
});

test('6.2.1: a link needs an accessible name, from its content or not', () => {
  const named = criterion(scan('<main><a href="/a" aria-label="Accueil"></a></main>'), '6.2');
  assert.notEqual(named.outcome, 'fail');
  assert.equal(by(named, 'rgaa-link-content-label-present'), undefined);
  const unnamed = criterion(scan('<main><a href="/a"></a></main>'), '6.2');
  assert.equal(unnamed.outcome, 'fail');
  assert.equal(by(unnamed, 'link-name-present').outcome, 'fail');
});

test('6.1: a title that leaves out an image link’s alternative fails nothing', () => {
  const c = criterion(
    scan('<main><a href="/a" title="Aller"><img src="a.png" alt="Accueil"></a></main>'),
    '6.1'
  );
  assert.notEqual(c.outcome, 'fail');
  assert.equal(by(c, 'rgaa-link-title-content-name'), undefined);
});

test('1.2.1 and 1.2.4: aria-hidden="true" is enough, and an informative image is asked about', () => {
  const img = scan('<main><p>x</p><img src="a.png" aria-hidden="true" title="Logo"></main>');
  assert.notEqual(criterion(img, '1.2').outcome, 'fail');
  const asked = by(criterion(img, '1.1'), 'rgaa-img-decorative-no-alternative');
  assert.equal(asked.outcome, 'cantTell');
  assert.deepEqual(asked.requirements, ['1.1.1']);
  const svg = scan(
    '<main><p>x</p><svg aria-hidden="true" width="10" height="10"><title>Icône</title><rect width="10" height="10"/></svg></main>'
  );
  assert.notEqual(criterion(svg, '1.2').outcome, 'fail');
  assert.equal(by(criterion(svg, '1.1'), 'rgaa-svg-hidden-no-alternative').outcome, 'cantTell');
});

test('1.9: a <figure> needs no role or aria-label', () => {
  const c = criterion(
    scan(
      '<main><figure><img src="a.png" alt="Chat"><figcaption>Un chat</figcaption></figure></main>'
    ),
    '1.9'
  );
  assert.notEqual(c.outcome, 'fail');
});

test('5.7.6: scope="colgroup" on a group header is a question, not a failure', () => {
  const c = criterion(
    scan(
      '<main><table><tr><th scope="colgroup" colspan="2">Groupe</th></tr><tr><th scope="col">A</th><th scope="col">B</th></tr><tr><td>1</td><td>2</td></tr></table></main>'
    ),
    '5.7'
  );
  assert.notEqual(c.outcome, 'fail');
  assert.deepEqual(by(c, 'rgaa-th-scope-row-col').requirements, ['5.7.2', '5.7.3', '5.7.6']);
});

test('8.1.1: a page with no doctype fails', () => {
  assert.equal(criterion(scan('<main><p>x</p></main>', { doctype: '' }), '8.1').outcome, 'fail');
});

test('9.2: a computed role is enough, and a page with no main zone fails', () => {
  for (const body of [
    '<header>Site</header><div role="main"><p>Texte</p></div>',
    '<div role="banner">Site</div><main><p>Texte</p></main>'
  ]) {
    assert.notEqual(criterion(scan(body), '9.2').outcome, 'fail', body);
  }
  assert.equal(criterion(scan('<p>Texte</p>'), '9.2').outcome, 'fail');
  const two = criterion(scan('<main><p>a</p></main><main><p>b</p></main>'), '9.2');
  assert.equal(by(two, 'landmark-no-duplicate-main').outcome, 'cantTell');
});

test('10.1.2: width and height on an <iframe> are a question, a <font> still fails', () => {
  const frame = criterion(
    scan(
      '<main><iframe src="https://example.org/v" title="Vidéo" width="560" height="315"></iframe></main>'
    ),
    '10.1'
  );
  assert.notEqual(frame.outcome, 'fail');
  assert.equal(by(frame, 'rgaa-presentational-attributes-absent').outcome, 'cantTell');
  assert.equal(criterion(scan('<main><p><font>x</font></p></main>'), '10.1').outcome, 'fail');
});

test('11.10: a login form is not failed, its fields asked about under 11.10.2', () => {
  const c = criterion(
    scan(
      '<main><form><label for="u">Identifiant</label><input id="u" required><label for="p">Mot de passe</label><input id="p" type="password" required><button>Connexion</button></form></main>'
    ),
    '11.10'
  );
  assert.notEqual(c.outcome, 'fail');
  assert.deepEqual(by(c, 'rgaa-required-field-indication').requirements, ['11.10.2']);
});

test('RGAA’s profile gives what it gives alone when RAWeb is in the scan', () => {
  const body =
    '<main><a href="/a" aria-label="Accueil"></a><figure><img src="a.png" alt="Chat"><figcaption>Un chat</figcaption></figure></main>';
  const both = quiet(() =>
    runa11yCoreOnHtml(page(body), {
      engineOptions: { packs: [rgaa, raweb], profile: 'rgaa-4.1.2' }
    })
  );
  const alone = quiet(() =>
    runa11yCoreOnHtml(page(body), { engineOptions: { packs: [rgaa], profile: 'rgaa-4.1.2' } })
  );
  const outcomes = (r) =>
    Object.fromEntries(r.rulesResults.map((x) => [x.ruleId, x.outcome]).sort());
  assert.deepEqual(outcomes(both), outcomes(alone));
  assert.equal(outcomes(both)['rgaa-4.1.2-6.2'], 'fail');
});
