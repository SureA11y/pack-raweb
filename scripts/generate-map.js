'use strict';

/**
 * Generate map.js and glossary.js from RAWeb's source data in data/ (see the
 * README there for provenance, licence and attribution).
 *
 * Usage:
 *   node scripts/generate-map.js           write the modules
 *   node scripts/generate-map.js --check   exit 1 if they are out of date
 *
 * The text is RAWeb's own, in French, with only its Markdown taken out:
 * glossary links keep their words and code spans lose their backticks.
 * Nothing is translated or reworded. RAWeb is under CC BY 3.0 LU, and the
 * modules say they hold an adaptation of it (markup removed, restructured as
 * data), as the licence asks.
 */

const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(PROFILE_DIR, 'data');
const OUTPUT_FILE = path.join(PROFILE_DIR, 'map.js');
const GLOSSARY_FILE = path.join(PROFILE_DIR, 'glossary.js');

// Oldest first. `published` is when the version was published;
// `wcagVersion` is the WCAG version its criteria are built on, through EN
// 301 549 V3.2.1.
const SOURCES = [
  {
    version: '1.1',
    published: '2026-02',
    wcagVersion: '2.1',
    file: 'fr/criteres.json',
    methodologies: 'fr/methodologies.json',
    glossary: 'fr/glossaire.json'
  }
];

function plainText(markdown) {
  return String(markdown)
    .replace(/<(a|span)\s[^>]*>(.*?)<\/\1>/g, '$2')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// The notes of a criterion, as RAWeb gives them: strings and { ul: [...] }.
function noteLines(value) {
  const out = [];
  for (const item of Array.isArray(value) ? value : value ? [value] : []) {
    if (typeof item === 'string') out.push(plainText(item));
    else if (item && Array.isArray(item.ul)) {
      out.push(...item.ul.map((li) => `- ${plainText(String(li).replace(/^-\s*/, ''))}`));
    }
  }
  return out.filter(Boolean);
}

// The glossary terms a text links to, by their anchors, in order.
function glossaryLinks(texts) {
  const out = [];
  for (const text of texts) {
    for (const m of String(text).matchAll(/\]\(#([^)]+)\)/g)) {
      if (!out.includes(m[1])) out.push(m[1]);
    }
  }
  return out;
}

const stepText = (markdown) => plainText(String(markdown).replace(/\*\*/g, ''));

// A test's methodology as RAWeb writes it: numbered steps, the last of which
// says when the test is passed. A sub-list stays in its step. "Tests
// identiques à 7.5.1" takes that test's steps.
// The tests RAWeb 1.1 publishes with no methodology (an empty text, in both
// languages): left with none, rather than borrowing RGAA's, which RAWeb
// changed (8.1 lost RGAA's 8.1.2 and 8.1.3). Any other empty one is an
// error, so a new gap is seen.
const NO_METHODOLOGY = ['8.1.1', '8.2.1'];

function methodologyOf(id, methodologies) {
  const source = String(methodologies[id] || '');
  if (!source.trim() && NO_METHODOLOGY.includes(id)) return null;
  const same = /^Tests? identiques? à ([\d.]+)/.exec(source.trim());
  if (same) return methodologyOf(same[1], methodologies);
  const steps = source
    .replace(/^Test [\d.]+\s*/, '')
    .split(/\n(?=\d+\.\s)/)
    .map((step) => stepText(step.replace(/^\s*\d+\.\s*/, '')))
    .filter(Boolean);
  if (!steps.length) throw new Error(`[generate-raweb-map] no methodology for test ${id}`);
  // The last step says when the test is passed, in all but one test (11.1.3).
  const last = steps.at(-1);
  if (steps.length < 2 || !/test est validé/.test(last)) return { steps };
  // What follows the verdict is a note on the test, not part of the verdict.
  const verdict = /^.*?test est validé\s*\.?/.exec(last)[0];
  const note = last.slice(verdict.length).trim();
  return { steps: steps.slice(0, -1), passWhen: verdict, ...(note ? { note } : {}) };
}

// "1.1.1 Non-text Content (A)" -> "1.1.1"
function wcagScOf(reference) {
  const m = /^(\d+\.\d+\.\d+) .+ \((A|AA|AAA)\)$/.exec(String(reference).trim());
  if (!m) throw new Error(`[generate-raweb-map] unrecognised WCAG reference: ${reference}`);
  return m[1];
}

// "9.1.1.1 Non-text Content" -> "9.1.1.1"
function clauseOf(reference) {
  const m = /^(\d+(?:\.\d+)+)\b/.exec(String(reference).trim());
  if (!m) throw new Error(`[generate-raweb-map] unrecognised EN 301 549 reference: ${reference}`);
  return m[1];
}

function referencesOf(criterium, kind) {
  return (criterium.references || []).flatMap((r) => (Array.isArray(r[kind]) ? r[kind] : []));
}

/**
 * The tables for one version of the source file: themes, criteria keyed
 * "1.1", tests keyed "1.1.1".
 */
function buildVersionTables(source, methodologies = {}) {
  const themes = [];
  const criteria = {};
  const tests = {};
  for (const topic of source.topics) {
    themes.push({ number: topic.number, title: plainText(topic.topic) });
    for (const { criterium } of topic.criteria) {
      const id = `${topic.number}.${criterium.number}`;
      const testIds = Object.keys(criterium.tests)
        .sort((a, b) => Number(a) - Number(b))
        .map((n) => `${id}.${n}`);
      criteria[id] = {
        theme: topic.number,
        title: plainText(criterium.title),
        wcagSc: [...new Set(referencesOf(criterium, 'wcag').map(wcagScOf))],
        techniques: referencesOf(criterium, 'techniques').map(String),
        en301549: [...new Set(referencesOf(criterium, 'norm').map(clauseOf))],
        tests: testIds,
        ...(criterium.particularCases
          ? { particularCases: noteLines(criterium.particularCases) }
          : {}),
        ...(criterium.technicalNote ? { technicalNotes: noteLines(criterium.technicalNote) } : {}),
        glossary: glossaryLinks([
          criterium.title,
          ...Object.values(criterium.tests).flat(),
          JSON.stringify([criterium.particularCases, criterium.technicalNote])
        ])
      };
      for (const testId of testIds) {
        const lines = criterium.tests[testId.slice(id.length + 1)];
        const [question, ...conditions] = lines;
        const glossary = glossaryLinks([...lines, criterium.title]);
        tests[testId] = {
          criterion: id,
          title: plainText(question),
          ...(conditions.length ? { conditions: conditions.map(plainText) } : {}),
          methodology: methodologyOf(testId, methodologies),
          ...(glossary.length ? { glossary } : {})
        };
      }
    }
  }
  return { themes, criteria, tests };
}

// A term's anchor, as RAWeb's site makes it from the term.
function termSlug(term) {
  return plainText(term)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const htmlEntities = { amp: '&', lt: '<', gt: '>', quot: '"', nbsp: '\u00a0' };

// A definition's HTML as plain text, a line per paragraph or list item.
function definitionLines(html) {
  return String(html)
    .replace(/<\/(p|li|ul|ol|h\d)>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot|nbsp);/g, (_, name) => htmlEntities[name])
    .split('\n')
    .map((line) => plainText(line))
    .filter(Boolean);
}

function glossaryOf(source) {
  const out = {};
  for (const { title, body } of source.glossary) {
    out[termSlug(title)] = { term: plainText(title), definition: definitionLines(body) };
  }
  return out;
}

function buildTables(readSource = (file) => fs.readFileSync(path.join(DATA_DIR, file), 'utf8')) {
  const out = { versions: [], themes: {}, criteria: {}, tests: {}, glossary: {} };
  for (const { version, published, wcagVersion, file, methodologies, glossary } of SOURCES) {
    const t = buildVersionTables(
      JSON.parse(readSource(file)),
      JSON.parse(readSource(methodologies))
    );
    out.versions.push({ version, published, wcagVersion });
    out.themes[version] = t.themes;
    out.criteria[version] = t.criteria;
    out.tests[version] = t.tests;
    out.glossary[version] = glossaryOf(JSON.parse(readSource(glossary)));
    // A link's anchor, as the term's: RAWeb writes a few with characters its
    // site leaves out of the anchor ("et/ou"), so a link is read as the site
    // reads it. A note may link to an anchor of another page of RAWeb's
    // site, which names no term here, and is left out.
    const terms = out.glossary[version];
    const termOf = (anchor) =>
      terms[anchor] ? anchor : terms[termSlug(anchor)] ? termSlug(anchor) : null;
    for (const row of [...Object.values(t.criteria), ...Object.values(t.tests)]) {
      if (!row.glossary) continue;
      row.glossary = [...new Set(row.glossary.map(termOf).filter(Boolean))];
      if (!row.glossary.length && !row.theme) delete row.glossary;
    }
  }
  return out;
}

function renderModule(tables) {
  const json = (v) => JSON.stringify(v, null, 2);
  return `/* SPDX-License-Identifier: MPL-2.0 AND LicenseRef-CC-BY-3.0-LU */

'use strict';

/**
 * RAWeb (Référentiel d’évaluation de l’accessibilité web), Luxembourg's
 * framework for assessing the accessibility of websites: its themes,
 * criteria and tests, per version.
 *
 * GENERATED by scripts/generate-map.js from data/
 * -- do not edit by hand; tests/map.test.js fails on any drift.
 *
 * SOURCE: Référentiel d’évaluation de l’accessibilité web (RAWeb) 1.1,
 * Service information et presse (SIP), Government of Luxembourg,
 * https://accessibilite.public.lu/fr/raweb1.1/index.html, from
 * https://github.com/accessibility-luxembourg/ReferentielAccessibiliteWeb
 * (fr/json/criteres.json). Licensed under CC BY 3.0 LU,
 * https://creativecommons.org/licenses/by/3.0/lu/ (data/fr/LICENSE.md).
 * The original work has been modified: its markup is removed and it is
 * restructured as data; the wording is RAWeb's own, neither reworded nor
 * translated. RAWeb contains an adapted copy of RGAA 4.1.2 by DINUM (see
 * data/README.md for RAWeb's full notice). The code around the text is
 * under MPL-2.0. This pack is not affiliated with or endorsed by the SIP,
 * the Government of Luxembourg or DINUM.
 *
 * SHAPE
 * -----
 * - RAWEB_VERSIONS: [{ version, published, wcagVersion }], oldest first.
 * - RAWEB_THEMES[version]: [{ number, title }], the 17 themes in order.
 * - RAWEB_CRITERIA[version]["1.1"]: { theme, title, wcagSc, techniques,
 *   en301549, tests, particularCases?, technicalNotes?, glossary }.
 *   \`wcagSc\` and \`en301549\` are RAWeb's own correspondences to WCAG 2.1
 *   and EN 301 549 V3.2.1; \`techniques\` the WCAG techniques and failures it
 *   cites; \`tests\` the ids of its tests; \`glossary\` the glossary terms it
 *   links to.
 * - RAWEB_TESTS[version]["1.1.1"]: { criterion, title, conditions?,
 *   methodology, glossary? }. \`conditions\` lists what a test enumerates;
 *   \`methodology\` is RAWeb's own { steps, passWhen, note? }.
 *
 * This states what a published document says, nothing more.
 */

const RAWEB_VERSIONS = ${json(tables.versions)};

const RAWEB_THEMES = ${json(tables.themes)};

const RAWEB_CRITERIA = ${json(tables.criteria)};

const RAWEB_TESTS = ${json(tables.tests)};

module.exports = { RAWEB_VERSIONS, RAWEB_THEMES, RAWEB_CRITERIA, RAWEB_TESTS };
`;
}

function renderGlossary(tables) {
  return `/* SPDX-License-Identifier: MPL-2.0 AND LicenseRef-CC-BY-3.0-LU */

'use strict';

/**
 * RAWeb's glossary, per version: what its tests mean by their words.
 *
 * GENERATED by scripts/generate-map.js from data/
 * -- do not edit by hand; tests/map.test.js fails on any drift.
 *
 * SOURCE: Référentiel d’évaluation de l’accessibilité web (RAWeb) 1.1,
 * Service information et presse (SIP), Government of Luxembourg,
 * https://accessibilite.public.lu/fr/raweb1.1/index.html, from
 * https://github.com/accessibility-luxembourg/ReferentielAccessibiliteWeb
 * (fr/json/glossaire.json). Licensed under CC BY 3.0 LU,
 * https://creativecommons.org/licenses/by/3.0/lu/ (data/fr/LICENSE.md).
 * The original work has been modified: its markup is removed and it is
 * restructured as data; the wording is RAWeb's own, neither reworded nor
 * translated. RAWeb contains an adapted copy of RGAA 4.1.2 by DINUM (see
 * data/README.md for RAWeb's full notice). The code around the text is
 * under MPL-2.0. This pack is not affiliated with or endorsed by the SIP,
 * the Government of Luxembourg or DINUM.
 *
 * SHAPE
 * -----
 * - RAWEB_GLOSSARY[version][anchor]: { term, definition }. \`anchor\` is the
 *   term's anchor in RAWeb's site, the one a test's \`glossary\` lists;
 *   \`definition\` a line per paragraph or list item.
 */

const RAWEB_GLOSSARY = ${JSON.stringify(tables.glossary, null, 2)};

module.exports = { RAWEB_GLOSSARY };
`;
}

async function formatted(source) {
  const prettier = require('prettier');
  const options = (await prettier.resolveConfig(OUTPUT_FILE)) || {};
  return prettier.format(source, { ...options, filepath: OUTPUT_FILE });
}

async function main() {
  const tables = buildTables();
  const outputs = [
    [OUTPUT_FILE, await formatted(renderModule(tables))],
    [GLOSSARY_FILE, await formatted(renderGlossary(tables))]
  ];
  if (process.argv.includes('--check')) {
    for (const [file, expected] of outputs) {
      const actual = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
      if (actual !== expected) {
        console.error(
          `[generate-raweb-map] ${path.relative(process.cwd(), file)} is out of date; run npm run map`
        );
        process.exit(1);
      }
    }
    console.log('[generate-raweb-map] up to date');
    return;
  }
  for (const [file, expected] of outputs) {
    fs.writeFileSync(file, expected, 'utf8');
    console.log(`[generate-raweb-map] wrote ${path.relative(process.cwd(), file)}`);
  }
}

module.exports = { SOURCES, plainText, buildTables, renderModule, renderGlossary, formatted };

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
