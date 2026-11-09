'use strict';

/**
 * How RAWeb 1.1's tests compare with RGAA 4.1.2's, test by test, for the
 * review of the rule map: which rules pack-rgaa links to each test, and
 * whether RAWeb keeps the test's text, changes only its form, rewords it or
 * removes it. Writes docs/RGAA_COMPARISON.md.
 *
 * Usage:
 *   node scripts/compare-rgaa.js           write the document
 *   node scripts/compare-rgaa.js --check   exit 1 if it is out of date
 *
 * "Form only" means the same words once case, punctuation, quotation marks
 * and spacing are set aside: such a change can't change what a test asks.
 * Anything else is "reworded", with the words RAWeb removes and adds, for a
 * person to judge; this script decides nothing.
 *
 * A rule can be affected where a test's question stays the same, so the
 * document also shows, in the same way, the methodology of each test that
 * has rules, the particular cases and technical notes of each criterion, and
 * the glossary entries, wherever RAWeb changes their words.
 */

const fs = require('fs');
const path = require('path');

const { RGAA_TESTS, RGAA_CRITERIA, RGAA_GLOSSARY } = require('@surea11y/pack-rgaa/public');
const { standardDataOf } = require('@surea11y/core/pack');
const rgaaPack = require('@surea11y/pack-rgaa');
const { RAWEB_TESTS, RAWEB_CRITERIA } = require('../map');
const { RAWEB_GLOSSARY } = require('../glossary');

const OUTPUT = path.join(__dirname, '..', 'docs', 'RGAA_COMPARISON.md');
const RGAA = '4.1.2';
const RAWEB = '1.1';

// A test's whole text: its question and the conditions it lists.
const textOf = (t) => [t.title, ...(t.conditions || [])].join(' ');

// The words of a text, as compared: lower case, without punctuation,
// quotation marks or the space around them.
function wordsOf(text) {
  return String(text)
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[«»“”"]/g, ' ')
    .replace(/[.,;:!?()[\]{}]/g, ' ')
    .replace(/ | /g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

// The words b removes from a and adds to it, in order: [{ op, words }].
function wordDiff(a, b) {
  const n = a.length;
  const m = b.length;
  const lcs = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const out = [];
  const push = (op, word) => {
    const last = out.at(-1);
    if (last && last.op === op) last.words.push(word);
    else out.push({ op, words: [word] });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push('=', a[i]);
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) push('-', a[i++]);
    else push('+', b[j++]);
  }
  while (i < n) push('-', a[i++]);
  while (j < m) push('+', b[j++]);
  return out;
}

// Text that is markup rather than words: entities, emphasis tags and the
// language marks of RAWeb's Markdown.
const clean = (text) =>
  String(text)
    .replace(/&[a-z]+;/g, ' ')
    .replace(/<\/?em[^>]*>/g, '')
    .replace(/\{lang="[a-z-]+"\}/g, '');

// A changed passage, as compared words and their diff, or null when only its
// form changes.
function changed(a, b) {
  const wa = wordsOf(clean(a));
  const wb = wordsOf(clean(b));
  return wa.join(' ') === wb.join(' ') ? null : wordDiff(wa, wb);
}

const methodologyOf = (t) =>
  t && t.methodology
    ? [...(t.methodology.steps || []), t.methodology.passWhen || ''].join(' ')
    : '';

// The rules pack-rgaa links to each RGAA test: by the row's tests, its asks,
// and the routes of its reason codes and findings.
function rulesByTest() {
  const ruleMap = standardDataOf(rgaaPack.standard).data[RGAA].ruleMap;
  const out = {};
  for (const [rule, row] of Object.entries(ruleMap)) {
    const tests = [...(row.requirements || []), ...(row.asks || [])];
    for (const route of Object.values(row.reasonCodes || {}))
      tests.push(...(route.requirements || []));
    for (const route of row.findings || []) tests.push(...(route.requirements || []));
    for (const t of tests) (out[t] = out[t] || new Set()).add(rule);
  }
  return Object.fromEntries(Object.entries(out).map(([t, s]) => [t, [...s].sort()]));
}

const byId = (a, b) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  }
  return 0;
};

/** Every RGAA test, and RAWeb's new tests under RGAA's criteria, sorted. */
function compare() {
  const rgaa = RGAA_TESTS[RGAA];
  const raweb = RAWEB_TESTS[RAWEB];
  const rules = rulesByTest();
  const rows = [];
  for (const id of Object.keys(rgaa).sort(byId)) {
    const linked = rules[id] || [];
    if (!raweb[id]) {
      rows.push({ id, kind: 'removed', rules: linked });
      continue;
    }
    const a = textOf(rgaa[id]);
    const b = textOf(raweb[id]);
    if (a === b) rows.push({ id, kind: 'unchanged', rules: linked });
    else {
      const wa = wordsOf(a);
      const wb = wordsOf(b);
      if (wa.join(' ') === wb.join(' ')) rows.push({ id, kind: 'form', rules: linked });
      else
        rows.push({
          id,
          kind: 'reworded',
          rules: linked,
          diff: wordDiff(wa, wb),
          rgaa: a,
          raweb: b
        });
    }
  }
  const sharedCriteria = new Set(Object.values(rgaa).map((t) => t.criterion));
  const added = Object.keys(raweb)
    .filter((id) => !rgaa[id] && sharedCriteria.has(raweb[id].criterion))
    .sort(byId);
  const methodology = rows
    .filter((r) => r.rules.length && r.kind !== 'removed')
    .map((r) => ({
      id: r.id,
      rules: r.rules,
      diff: changed(methodologyOf(rgaa[r.id]), methodologyOf(raweb[r.id]))
    }))
    .filter((r) => r.diff);

  const ca = RGAA_CRITERIA[RGAA];
  const cb = RAWEB_CRITERIA[RAWEB];
  const criteria = [];
  for (const id of Object.keys(ca).sort(byId)) {
    if (!cb[id]) continue;
    for (const [field, label] of [
      ['particularCases', 'particular cases'],
      ['technicalNotes', 'technical notes']
    ]) {
      const diff = changed((ca[id][field] || []).join(' '), (cb[id][field] || []).join(' '));
      if (diff) criteria.push({ id, label, diff });
    }
  }

  const ga = RGAA_GLOSSARY[RGAA];
  const gb = RAWEB_GLOSSARY[RAWEB];
  const glossary = Object.keys(ga)
    .filter((k) => gb[k])
    .sort()
    .map((k) => ({ id: k, diff: changed(ga[k].definition.join(' '), gb[k].definition.join(' ')) }))
    .filter((g) => g.diff);
  const glossaryAdded = Object.keys(gb)
    .filter((k) => !ga[k])
    .sort();
  const glossaryRemoved = Object.keys(ga)
    .filter((k) => !gb[k])
    .sort();

  return { rows, added, methodology, criteria, glossary, glossaryAdded, glossaryRemoved };
}

const showDiff = (diff) =>
  diff
    .map((p) =>
      p.op === '='
        ? p.words.join(' ')
        : p.op === '-'
          ? `~~${p.words.join(' ')}~~`
          : `**${p.words.join(' ')}**`
    )
    .join(' ');

function render({ rows, added, methodology, criteria, glossary, glossaryAdded, glossaryRemoved }) {
  const count = (kind, linked) =>
    rows.filter((r) => r.kind === kind && (linked === undefined || r.rules.length > 0 === linked))
      .length;
  const out = [];
  out.push('# RAWeb 1.1 and RGAA 4.1.2, test by test');
  out.push('');
  out.push('<!-- GENERATED by scripts/compare-rgaa.js; do not edit by hand. -->');
  out.push('');
  out.push(
    'For the review of the rule map: each RGAA 4.1.2 test, whether RAWeb 1.1 keeps its text, changes only its form, rewords it or removes it, and the rules `@surea11y/pack-rgaa` links to it. **Form only** is the same words once case, punctuation, quotation marks and spacing are set aside; **reworded** shows the words RAWeb removes (~~struck~~) and adds (**bold**). The comparison decides nothing: each reworded test with rules is judged by a person, in the rule map.'
  );
  out.push('');
  out.push(
    "RAWeb's and RGAA's texts are quoted from their reference files: RAWeb 1.1, Service information et presse (SIP), Government of Luxembourg, under CC BY 3.0 LU, and RGAA 4.1.2, DINUM, under the Licence Ouverte 2.0 ([`data/README.md`](../data/README.md)), with their markup removed."
  );
  out.push('');
  out.push('| | Tests | With rules |');
  out.push('|---|---:|---:|');
  for (const [kind, label] of [
    ['unchanged', 'Unchanged'],
    ['form', 'Form only'],
    ['reworded', 'Reworded'],
    ['removed', 'Removed']
  ]) {
    out.push(`| ${label} | ${count(kind)} | ${count(kind, true)} |`);
  }
  out.push(`| Added under RGAA's criteria | ${added.length} | |`);
  out.push('');
  out.push('## Reworded tests with rules');
  out.push('');
  for (const r of rows.filter((x) => x.kind === 'reworded' && x.rules.length)) {
    out.push(`### ${r.id}`);
    out.push('');
    out.push(`Rules: ${r.rules.map((x) => `\`${x}\``).join(', ')}`);
    out.push('');
    out.push(showDiff(r.diff));
    out.push('');
  }
  out.push('## Removed tests');
  out.push('');
  for (const r of rows.filter((x) => x.kind === 'removed')) {
    out.push(`- ${r.id}${r.rules.length ? `: ${r.rules.map((x) => `\`${x}\``).join(', ')}` : ''}`);
  }
  out.push('');
  out.push("## Tests RAWeb adds under RGAA's criteria");
  out.push('');
  out.push(added.map((id) => `- ${id}`).join('\n'));
  out.push('');
  out.push('## Form only, and reworded tests no rule is linked to');
  out.push('');
  out.push(
    `- Form only: ${rows
      .filter((r) => r.kind === 'form')
      .map((r) => r.id)
      .join(', ')}`
  );
  out.push(
    `- Reworded, no rule: ${rows
      .filter((r) => r.kind === 'reworded' && !r.rules.length)
      .map((r) => r.id)
      .join(', ')}`
  );
  out.push('');
  out.push('## Methodology changed, on tests with rules');
  out.push('');
  out.push(
    "A test's question can stay the same while its methodology says differently what to check; each such test with rules, with RAWeb's changes to its steps."
  );
  out.push('');
  for (const r of methodology) {
    out.push(`### ${r.id}`);
    out.push('');
    out.push(`Rules: ${r.rules.map((x) => `\`${x}\``).join(', ')}`);
    out.push('');
    out.push(showDiff(r.diff));
    out.push('');
  }
  out.push('## Particular cases and technical notes changed');
  out.push('');
  for (const c of criteria) {
    out.push(`### ${c.id}, ${c.label}`);
    out.push('');
    out.push(showDiff(c.diff));
    out.push('');
  }
  out.push('## Glossary changed');
  out.push('');
  out.push(`- Entries RAWeb adds: ${glossaryAdded.join(', ')}`);
  out.push(`- Entries RAWeb removes: ${glossaryRemoved.join(', ')}`);
  out.push('');
  for (const g of glossary) {
    out.push(`### ${g.id}`);
    out.push('');
    out.push(showDiff(g.diff));
    out.push('');
  }
  return out.join('\n');
}

function main() {
  const doc = render(compare());
  if (process.argv.includes('--check')) {
    const actual = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf8') : '';
    if (actual !== doc) {
      console.error('[compare-rgaa] docs/RGAA_COMPARISON.md is out of date; run npm run compare');
      process.exit(1);
    }
    console.log('[compare-rgaa] up to date');
    return;
  }
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, doc);
  console.log('[compare-rgaa] wrote docs/RGAA_COMPARISON.md');
}

module.exports = { compare, wordsOf, wordDiff };

if (require.main === module) main();
