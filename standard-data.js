/* SPDX-License-Identifier: MPL-2.0 AND LicenseRef-CC-BY-3.0-LU */

'use strict';

/**
 * RAWeb 1.1 as standard data (core's format surea11y-standard/1), built on
 * RGAA 4.1.2's (core's deriveStandard, on @surea11y/pack-rgaa's data):
 *
 * - Its criteria and tests are RAWeb's own, in its own words (map.js), each
 *   based on the RGAA criterion or test of the same number where RGAA has
 *   one, so pack-rgaa's rule map reaches them.
 * - Its rule map is pack-rgaa's, with the changes docs/RULE_MAP_REVIEW.md
 *   records for what RAWeb says differently (OWN_ROWS).
 * - Each test's procedure is RAWeb's methodology; the English texts are
 *   RAWeb's own English version.
 * - The profile raweb-1.1 and the law it is used for.
 *
 * The French and English texts are RAWeb's, by the Service information et
 * presse (SIP), Government of Luxembourg, under CC BY 3.0 LU (data/README.md),
 * restructured as data and not reworded; what joins them (failWhen, the
 * labels of notes) and the rule map are this pack's.
 */

const { deriveStandard, standardDataOf } = require('@surea11y/core/pack');
const rgaa = require('@surea11y/pack-rgaa');
const {
  RAWEB_VERSIONS,
  RAWEB_THEMES,
  RAWEB_CRITERIA,
  RAWEB_TESTS,
  RAWEB_TRANSLATIONS
} = require('./map');

const VERSION = '1.1';
const BASE = { standard: 'rgaa', version: '4.1.2' };

const base = standardDataOf(rgaa.standard);
const baseTables = base.data[BASE.version];

// A test's text as a person reads it: its question and the conditions it
// lists.
const testTitle = (t) => [t.title, ...(t.conditions || []).map((c) => `- ${c}`)].join(' ');

const PASS_WHEN = {
  fr: 'Si c’est le cas, le test est validé.',
  en: 'If this is the case, the test is validated.'
};
const failWhen = {
  fr: (id) => `Sinon, le test ${id} n’est pas validé.`,
  en: (id) => `Otherwise, test ${id} is not validated.`
};

// RAWeb 1.1 publishes no methodology for 8.1.1 and 8.2.1 (map.js). A person
// still needs steps: these are the pack's, from the test's question and the
// glossary « Type de document », and the criterion's note says so.
const OWN_STEPS = {
  fr: {
    '8.1.1': [
      'Retrouver dans le code source de la page la balise doctype.',
      'Vérifier qu’elle est présente, placée avant la balise <html>, et qu’elle déclare un type de document HTML.'
    ],
    '8.2.1': [
      'Valider le code source généré de la page selon le type de document déclaré, par exemple avec le validateur HTML du W3C.',
      'Vérifier l’absence d’erreur de validation.'
    ]
  },
  en: {
    '8.1.1': [
      'Find the doctype in the page’s source code.',
      'Check that it is present, placed before the <html> tag, and that it declares an HTML document type.'
    ],
    '8.2.1': [
      'Validate the page’s generated source code against the declared document type, for example with the W3C HTML validator.',
      'Check that there is no validation error.'
    ]
  }
};
const OWN_STEPS_NOTE = (test) =>
  `Le RAWeb 1.1 ne publie pas de méthodologie pour le test ${test} : ses étapes sont celles de ce module, tirées de la question du test et du glossaire « Type de document ».`;

// A test's methodology as a procedure, in one language.
function procedureOf(id, methodology, lang) {
  if (!methodology) {
    return OWN_STEPS[lang][id]
      ? { steps: OWN_STEPS[lang][id], passWhen: PASS_WHEN[lang], failWhen: failWhen[lang](id) }
      : null;
  }
  return {
    steps: methodology.steps,
    passWhen: methodology.passWhen || PASS_WHEN[lang],
    failWhen: failWhen[lang](id)
  };
}

// A criterion's particular cases, technical notes and test notes, under
// their headings, in French: RAWeb's English gives none of them.
function noteOf(id) {
  const c = RAWEB_CRITERIA[VERSION][id];
  const parts = [];
  if (c.particularCases) parts.push(`Cas particuliers : ${c.particularCases.join(' ')}`);
  if (c.technicalNotes) parts.push(`Notes techniques : ${c.technicalNotes.join(' ')}`);
  for (const test of c.tests) {
    const m = RAWEB_TESTS[VERSION][test].methodology;
    if (m && m.note) parts.push(`Note du test ${test} : ${m.note}`);
    if (!m && OWN_STEPS.fr[test]) parts.push(OWN_STEPS_NOTE(test));
  }
  return parts.join(' ');
}

// A row of pack-rgaa's rule map, changed. RGAA's test numbers are RAWeb's
// where RAWeb keeps a test, so a route names the same ids.
function rgaaRow(ruleId, change) {
  const row = baseTables.ruleMap[ruleId];
  if (!row) throw new Error(`pack-rgaa has no rule-map row for ${ruleId}`);
  return change(JSON.parse(JSON.stringify(row)));
}

// What RAWeb says differently from RGAA, rule by rule: docs/RULE_MAP_REVIEW.md
// gives the reasons, and tests/standard.test.js a page for each.
const OWN_ROWS = {
  // 1.2.1, condition 2: aria-hidden="true" alone is enough. A hidden image
  // with a name passes 1.2.1 if decorative, and fails 1.1.1 if it carries
  // information, which only a person can tell.
  'rgaa-img-decorative-no-alternative': rgaaRow('rgaa-img-decorative-no-alternative', (row) => ({
    ...row,
    reasonCodes: {
      ...row.reasonCodes,
      hiddenImgHasAlternative: { requirements: ['1.1.1'], outcome: 'cantTell' }
    },
    note: 'RAWeb 1.2.1, condition 2, accepts aria-hidden="true" alone: an <img aria-hidden="true"> with a title or an ARIA name passes 1.2.1 if it is decorative, and fails 1.1.1 if it carries information, so it is a question under 1.1.1 (hiddenImgHasAlternative). An image marked decorative by alt="" or a presentation role that keeps a name is asked about under 1.2.1, 1.1.1 and 1.3.1, as RGAA: conditions 1 and 3 forbid the name.'
  })),
  // 1.2.4: aria-hidden="true" is enough for a decorative SVG.
  'rgaa-svg-hidden-no-alternative': rgaaRow('rgaa-svg-hidden-no-alternative', (row) => ({
    ...row,
    requirements: [],
    asks: ['1.1.5'],
    note: 'RAWeb 1.2.4 asks only aria-hidden="true" of a decorative <svg>: an <svg aria-hidden="true"> with a name passes it. Whether the image carries information, and so is wrongly hidden, is asked under 1.1.5.'
  })),
  'svg-text-alternative-quality': rgaaRow('svg-text-alternative-quality', (row) => ({
    ...row,
    reasonCodes: { ...row.reasonCodes, TEXT_ALTERNATIVE_REVIEW: { requirements: ['1.3.6'] } },
    note: 'Asks a person to judge the relevance of an <svg>’s title or ARIA name, which is 1.3.6. An <svg> found decorative that keeps its alternative no longer fails RAWeb 1.2.4, which asks only aria-hidden="true". An image that is a link’s or button’s only content counts toward no test: its alternative is the control’s name.'
  })),
  // 1.9: RAWeb removes the role and aria-label conditions this rule checks.
  'rgaa-figure-caption-structure': null,
  // 5.7.6: RAWeb accepts scope="rowgroup" and "colgroup" on a header over a
  // group of rows or columns.
  'rgaa-th-scope-row-col': rgaaRow('rgaa-th-scope-row-col', (row) => ({
    ...row,
    findings: [
      {
        when: { scope: 'rowgroup' },
        requirements: ['5.7.2', '5.7.3', '5.7.6'],
        outcome: 'cantTell'
      },
      {
        when: { scope: 'colgroup' },
        requirements: ['5.7.2', '5.7.3', '5.7.6'],
        outcome: 'cantTell'
      }
    ],
    note: 'Fails a <th> whose scope is neither row nor col nor, as RAWeb 5.7.6 adds, rowgroup or colgroup (a misspelt or empty value): 5.7.2 wants row or col on a header over a whole row or column, and 5.7.3 no scope on one over part of it. scope="rowgroup" or "colgroup" passes 5.7.6 on a header over a group of rows or columns, and fails 5.7.2 or 5.7.3 on any other, which only a person can tell: it is a question under the three. Also fails a scope pointing the wrong way where the table’s shape makes it certain.'
  })),
  // 6.1.6: RAWeb's own test for identical links; the glossary note RGAA's
  // 6.1.1 to 6.1.4 leaned on is gone.
  'identical-links-same-purpose': rgaaRow('identical-links-same-purpose', () => ({
    requirements: [],
    asks: ['6.1.6'],
    note: 'Asks whether links with the same name and different destinations serve the same purpose: RAWeb 6.1.6, « Chaque lien identique a-t-il les mêmes fonction et destination ? », with the glossary « Lien identique ». It only asks, since the context may tell the links apart.',
    outsideCorrespondence: {
      '6.1.6':
        'RAWeb relates criterion 6.1 to WCAG 2.4.4 and not to 2.4.9, under which core files this rule, yet 6.1.6 asks exactly its question: whether links with the same name have the same function and destination.'
    }
  })),
  // 6.1.2, 6.1.3: RAWeb removes the glossary note this rule rests on.
  'rgaa-link-title-content-name': null,
  // 6.2.1: an accessible name is enough.
  'rgaa-link-content-label-present': null,
  'link-name-present': {
    requirements: ['6.2.1'],
    note: 'Fails a link with no accessible name at all, which is RAWeb 6.2.1, « chaque lien a-t-il un intitulé ? »: RAWeb’s glossary « Intitulé (ou nom accessible) de lien » takes the name from aria-labelledby, aria-label, the content or title, in that order, and its revision notes limit 6.2 to a link with no accessible name.'
  },
  // 8.1.1: one test for RGAA's three (present, valid, before <html>).
  'rgaa-doctype-valid': rgaaRow('rgaa-doctype-valid', (row) => ({
    ...row,
    requirements: ['8.1.1'],
    note: 'RAWeb 8.1.1 asks whether each page is defined by a document type, in place of RGAA’s 8.1.1 to 8.1.3. A doctype whose name is not html does not define the page for user agents (glossary « Type de document »), so it fails; an unknown public identifier is asked about.'
  })),
  'rgaa-doctype-position': rgaaRow('rgaa-doctype-position', (row) => ({
    ...row,
    requirements: ['8.1.1'],
    note: 'RAWeb 8.1.1 asks whether each page is defined by a document type. A doctype written after <html> is dropped by the HTML parser, so it defines nothing for user agents: it fails 8.1.1. It asks when the page source is not given.'
  })),
  // 9.2.1: a computed role, from the element or role; no single visible
  // <main> condition (9.2.2 has one, on the computed role).
  'rgaa-main-element-structure': rgaaRow('rgaa-main-element-structure', (row) => ({
    ...row,
    reasonCodes: {
      ...row.reasonCodes,
      roleMainOnly: { requirements: [] },
      roleZoneOnly: { requirements: [] },
      extraMain: { requirements: [] },
      revealableMain: { requirements: [] },
      hiddenByAncestor: { requirements: [] }
    },
    note: 'RAWeb 9.2.1 asks for a computed role of main on the main content zone, from <main> or role="main": a page with text and neither fails it (noMain), and one whose main content may be in a frame, or whose every <main> is hidden, is asked about. A role on another element, a second <main> and how one is hidden count toward no test: RAWeb accepts role="main" and the other zone roles on any element, and its single visible main is 9.2.2’s, on the computed role.'
  })),
  // 9.2.2: one visible element of each computed role.
  'landmark-no-duplicate-main': {
    requirements: ['9.2.2'],
    note: 'Asks about a page exposing more than one main landmark: RAWeb 9.2.2, condition 1, « un seul élément visible avec le rôle calculé de main ». Only landmarks exposed to assistive technologies are counted.'
  },
  'landmark-no-duplicate-banner': {
    requirements: ['9.2.2'],
    note: 'Asks about a page exposing more than one banner landmark: RAWeb 9.2.2, condition 2, « un seul élément visible avec le rôle calculé de banner ».'
  },
  'landmark-no-duplicate-contentinfo': {
    requirements: ['9.2.2'],
    note: 'Asks about a page exposing more than one contentinfo landmark: RAWeb 9.2.2, condition 3, « un seul élément visible avec le rôle calculé de contentinfo ».'
  },
  // 10.1.2: width and height are allowed on <iframe> and <source>.
  'rgaa-presentational-attributes-absent': rgaaRow(
    'rgaa-presentational-attributes-absent',
    (row) => ({
      ...row,
      findings: [
        { when: { element: 'iframe' }, requirements: ['10.1.2'], outcome: 'cantTell' },
        { when: { element: 'source' }, requirements: ['10.1.2'], outcome: 'cantTell' }
      ],
      note: 'Fails each element carrying an attribute RAWeb 10.1.2 lists. RAWeb allows width and height on <iframe> and <source>, which RGAA does not, and still forbids frameborder or align there: the rule reports an element’s attributes together, so one on an <iframe> or a <source> is a question, for a person to see which it carries.'
    })
  ),
  // 11.10: a login form (an identifier and a password) is not applicable,
  // which the rule doesn't tell; condition 2 of 11.10.1 accepts a field with
  // required.
  'rgaa-required-field-indication': rgaaRow('rgaa-required-field-indication', (row) => ({
    ...row,
    reasonCodes: {
      ...row.reasonCodes,
      requiredNotIndicated: { requirements: ['11.10.2'], outcome: 'cantTell' },
      allFieldsRequiredSentence: { requirements: ['11.10.2'], outcome: 'cantTell' },
      markerNotExplained: { requirements: ['11.10.2'], outcome: 'cantTell' },
      markerExplainedAfter: { outcome: 'cantTell' }
    },
    note: 'Asks about a required field whose label and linked passages show no indication, and about a sign explained after its first use or never: RAWeb’s particular case of 11.10 leaves out a form of only an identifier and a password field, which only a person can tell, so its findings are questions. A field with required or aria-required="true" meets condition 2 of 11.10.1, so what is found on such a field counts toward 11.10.2 only.'
  })),
  // 12.6.1 leaves out the main zones this rule looks for.
  'rgaa-page-zones-reachable': null
};

const criteria = RAWEB_CRITERIA[VERSION];
const tests = RAWEB_TESTS[VERSION];
const en = RAWEB_TRANSLATIONS[VERSION].en;

const requirements = Object.fromEntries(
  Object.entries(criteria).map(([id, c]) => {
    const note = noteOf(id);
    return [
      id,
      {
        ...(baseTables.requirements[id] ? { basedOn: [{ standard: 'rgaa', id }] } : {}),
        title: c.title,
        wcagSc: c.wcagSc,
        tests: c.tests,
        // A criterion of RAWeb's own, which no rule checks in full.
        ...(baseTables.requirements[id] ? {} : { partial: true }),
        ...(note ? { note } : {})
      }
    ];
  })
);

const testRows = Object.fromEntries(
  Object.entries(tests).map(([id, t]) => {
    const procedure = procedureOf(id, t.methodology, 'fr');
    return [
      id,
      {
        ...(baseTables.tests[id] ? { basedOn: [{ standard: 'rgaa', id }] } : {}),
        title: testTitle(t),
        requirements: [t.criterion],
        ...(procedure ? { procedure } : {})
      }
    ];
  })
);

// RAWeb's own English, keyed as core reads a version's texts.
function englishTexts() {
  const out = {};
  for (const id of Object.keys(criteria)) out[`requirements.${id}.title`] = en.criteria[id].title;
  for (const [id, t] of Object.entries(tests)) {
    const e = en.tests[id];
    out[`tests.${id}.title`] = testTitle(e);
    const procedure = procedureOf(id, e.methodology, 'en');
    if (procedure && procedureOf(id, t.methodology, 'fr')) {
      out[`tests.${id}.procedure.steps`] = procedure.steps;
      out[`tests.${id}.procedure.passWhen`] = procedure.passWhen;
      out[`tests.${id}.procedure.failWhen`] = procedure.failWhen;
    }
  }
  for (const theme of en.themes) out[`groups.${theme.number}.title`] = theme.title;
  out.notes = NOTES.en;
  return out;
}

// What a reader should know before using the procedures.
const NOTES = {
  fr: [
    'Ces procédures reprennent la méthodologie de test du RAWeb 1.1 (Service information et presse, Gouvernement du Grand-Duché de Luxembourg, CC BY 3.0 LU). Elles s’utilisent avec le référentiel et son glossaire (https://accessibilite.public.lu/fr/raweb1.1/index.html) et ne les remplacent pas.',
    'Chaque facette liste les règles qui portent sur son test : celles de @surea11y/pack-rgaa et de @surea11y/core que la correspondance de ce module rattache à ce test (docs/RULE_MAP_REVIEW.md).'
  ],
  en: [
    'These procedures follow the RAWeb 1.1 testing methodology (Service information et presse, Government of the Grand Duchy of Luxembourg, CC BY 3.0 LU). They are used with the framework and its glossary (https://accessibilite.public.lu/en/raweb1.1/index.html) and do not replace them.',
    'Each facet lists the rules that check its test: those of @surea11y/pack-rgaa and @surea11y/core that this pack’s mapping links to the test (docs/RULE_MAP_REVIEW.md).'
  ]
};

// The law the profile is used for, named with a link to its official text:
// the pack tests RAWeb's criteria and says which law a scan was run for; it
// doesn't document the law.
const LAWS = {
  'lu-loi-2019-05-28': {
    name: 'Loi du 28 mai 2019 relative à l’accessibilité des sites internet et des applications mobiles des organismes du secteur public',
    jurisdiction: 'LU',
    sources: [
      {
        title: 'Legilux, loi du 28 mai 2019',
        url: 'https://legilux.public.lu/eli/etat/leg/loi/2019/05/28/a373/jo'
      }
    ]
  }
};

const wcagVersionOf = (version) => RAWEB_VERSIONS.find((v) => v.version === version).wcagVersion;

// RAWeb alone: the rules its map links to a test, pack-rgaa's and core's
// (mappedRules), and nothing else, so results hold RAWeb's criteria and no
// WCAG ones. RAWeb relates 8.1 and 8.2 to WCAG 4.1.1 Parsing, which the 2023
// errata to WCAG 2.1 no longer count: keepsParsing keeps a duplicate id a
// failure of 8.2.1.
const PROFILES = {
  'raweb-1.1': {
    version: VERSION,
    tags: ['raweb'],
    mappedRules: true,
    wcagVersion: wcagVersionOf(VERSION),
    keepsParsing: true,
    law: 'lu-loi-2019-05-28'
  }
};

const STANDARD_DATA = deriveStandard([base], {
  format: 'surea11y-standard/1',
  key: 'raweb',
  standard: 'RAWeb',
  lang: 'fr',
  // As RGAA: mapped rule by rule, and a rule is linked only to tests whose
  // WCAG criteria meet its own, unless its row says why.
  options: { ruleMapped: true, wcagCorrespondence: true },
  versions: RAWEB_VERSIONS.map(({ version, wcagVersion, published }) => ({
    version,
    wcagVersion,
    published,
    basedOn: [BASE]
  })),
  data: {
    [VERSION]: {
      groups: RAWEB_THEMES[VERSION].map(({ number, title }) => ({
        id: String(number),
        title,
        requirements: Object.keys(criteria).filter((id) => criteria[id].theme === number)
      })),
      requirements,
      tests: testRows,
      ruleMap: OWN_ROWS,
      notes: NOTES.fr,
      texts: { en: englishTexts() }
    }
  },
  profiles: PROFILES,
  laws: LAWS,
  texts: {
    en: {
      'laws.lu-loi-2019-05-28.name':
        'Law of 28 May 2019 on the accessibility of the websites and mobile applications of public sector bodies'
    }
  }
});

module.exports = { STANDARD_DATA, OWN_ROWS };
